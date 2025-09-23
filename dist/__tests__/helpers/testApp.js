"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestApp = createTestApp;
const express_1 = __importDefault(require("express"));
const tenant_1 = require("../../middlewares/tenant");
const testDataSource_1 = require("./testDataSource");
const User_1 = require("../../entities/User");
const UserSession_1 = require("../../entities/UserSession");
const Member_1 = require("../../entities/Member");
const Congregacao_1 = require("../../entities/Congregacao");
// Versões de teste das rotas que usam TestDataSource
function createTestAuthRouter() {
    const { Router } = require('express');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');
    const router = Router();
    function signAccessToken(userId) {
        return jwt.sign({ user_id: userId }, process.env.JWT_SECRET || 'dev', { expiresIn: '1h' });
    }
    function generateRefreshToken() {
        return crypto.randomBytes(64).toString('hex');
    }
    function hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    router.post('/register', async (req, res) => {
        const { nome, email, senha } = req.body;
        if (!email || !senha || !nome)
            return res.status(400).json({ message: 'Missing fields' });
        const userRepo = testDataSource_1.TestDataSource.getRepository(User_1.User);
        const existing = await userRepo.findOne({ where: { email } });
        if (existing)
            return res.status(409).json({ message: 'Email already in use' });
        const hash = await bcrypt.hash(senha, 10);
        const user = userRepo.create({ nome, email, senha_hash: hash });
        await userRepo.save(user);
        return res.status(201).json({ id: user.usuario_id, nome: user.nome, email: user.email });
    });
    router.post('/login', async (req, res) => {
        const { email, senha } = req.body;
        if (!email || !senha)
            return res.status(400).json({ message: 'Missing fields' });
        const userRepo = testDataSource_1.TestDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { email } });
        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });
        const match = await bcrypt.compare(senha, user.senha_hash);
        if (!match)
            return res.status(401).json({ message: 'Invalid credentials' });
        const accessToken = signAccessToken(user.usuario_id);
        const refreshToken = generateRefreshToken();
        const refreshHash = hashToken(refreshToken);
        const sessionRepo = testDataSource_1.TestDataSource.getRepository(UserSession_1.UserSession);
        const session = sessionRepo.create({
            user_id: user.usuario_id,
            refresh_token_hash: refreshHash,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        await sessionRepo.save(session);
        return res.json({ accessToken, refreshToken });
    });
    router.post('/refresh', async (req, res) => {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ message: 'Missing refreshToken' });
        const refreshHash = hashToken(refreshToken);
        const sessionRepo = testDataSource_1.TestDataSource.getRepository(UserSession_1.UserSession);
        const session = await sessionRepo.findOne({ where: { refresh_token_hash: refreshHash } });
        if (!session || session.revoked || session.expires_at < new Date()) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        const accessToken = signAccessToken(session.user_id);
        const newRefresh = generateRefreshToken();
        session.refresh_token_hash = hashToken(newRefresh);
        session.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await sessionRepo.save(session);
        return res.json({ accessToken, refreshToken: newRefresh });
    });
    router.post('/logout', async (req, res) => {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ message: 'Missing refreshToken' });
        const refreshHash = hashToken(refreshToken);
        const sessionRepo = testDataSource_1.TestDataSource.getRepository(UserSession_1.UserSession);
        const session = await sessionRepo.findOne({ where: { refresh_token_hash: refreshHash } });
        if (!session)
            return res.status(200).json({});
        session.revoked = true;
        await sessionRepo.save(session);
        return res.status(200).json({});
    });
    return router;
}
function createTestMembersRouter() {
    const { Router } = require('express');
    const router = Router();
    const { authorize } = require('../../middlewares/authorize');
    router.get('/', async (req, res) => {
        const repo = testDataSource_1.TestDataSource.getRepository(Member_1.Member);
        const where = {};
        if (req.congregacao_id)
            where.congregacao_id = req.congregacao_id;
        const items = await repo.find({ where });
        res.json(items);
    });
    router.post('/', authorize('members', 'create'), async (req, res) => {
        const { nome, cpf, telefone } = req.body;
        if (!nome)
            return res.status(400).json({ message: 'Missing nome' });
        const repo = testDataSource_1.TestDataSource.getRepository(Member_1.Member);
        const data = { nome, cpf, telefone };
        if (req.congregacao_id)
            data.congregacao_id = req.congregacao_id;
        if (req.user_id)
            data.created_by = req.user_id;
        const m = repo.create(data);
        await repo.save(m);
        res.status(201).json(m);
    });
    // update
    router.put('/:id', authorize('members', 'update'), async (req, res) => {
        const repo = testDataSource_1.TestDataSource.getRepository(Member_1.Member);
        const member = await repo.findOne({ where: { membro_id: req.params.id } });
        if (!member)
            return res.status(404).json({ message: 'Member not found' });
        if (req.congregacao_id && member.congregacao_id !== req.congregacao_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { nome, cpf, telefone } = req.body;
        if (nome !== undefined)
            member.nome = nome;
        if (cpf !== undefined)
            member.cpf = cpf;
        if (telefone !== undefined)
            member.telefone = telefone;
        await repo.save(member);
        res.json(member);
    });
    // delete
    router.delete('/:id', authorize('members', 'delete'), async (req, res) => {
        const repo = testDataSource_1.TestDataSource.getRepository(Member_1.Member);
        const member = await repo.findOne({ where: { membro_id: req.params.id } });
        if (!member)
            return res.status(404).json({ message: 'Member not found' });
        if (req.congregacao_id && member.congregacao_id !== req.congregacao_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await repo.remove(member);
        res.status(204).send();
    });
    return router;
}
function createTestApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // aplicar middleware de tenant nos testes para simular comportamento de produção
    app.use(tenant_1.tenantMiddleware);
    // middleware de simulação de auth: pega x-user-id e anexa a req.user_id
    app.use(async (req, _res, next) => {
        const uid = req.headers['x-user-id'];
        if (uid) {
            req.user_id = Array.isArray(uid) ? uid[0] : uid;
            return next();
        }
        // no x-user-id provided: ensure a default system user exists with admin role
        const userRepo = testDataSource_1.TestDataSource.getRepository(User_1.User);
        let sys = await userRepo.findOne({ where: { email: 'test.system@local' } });
        if (!sys) {
            // create a system user; password hash can be empty as tests won't login
            sys = userRepo.create({ nome: 'System', email: 'test.system@local', senha_hash: 'system', roles: ['admin'] });
            await userRepo.save(sys);
        }
        req.user_id = sys.usuario_id;
        return next();
    });
    // Rotas de teste
    app.use('/auth', createTestAuthRouter());
    app.use('/members', createTestMembersRouter());
    // incluir rota de roles de teste (usa TestDataSource)
    function createTestRolesRouter() {
        const { Router } = require('express');
        const router = Router();
        router.post('/roles', async (req, res) => {
            const { name, permissions } = req.body;
            if (!name)
                return res.status(400).json({ message: 'Missing name' });
            const repo = testDataSource_1.TestDataSource.getRepository(require('../../entities/Role').Role);
            const existing = await repo.findOne({ where: { name } });
            if (existing)
                return res.status(409).json({ message: 'Role exists' });
            const r = repo.create({ name, permissions: permissions || [] });
            await repo.save(r);
            res.status(201).json(r);
        });
        router.post('/users/:id/roles', async (req, res) => {
            const userRepo = testDataSource_1.TestDataSource.getRepository(require('../../entities/User').User);
            const roleRepo = testDataSource_1.TestDataSource.getRepository(require('../../entities/Role').Role);
            const u = await userRepo.findOne({ where: { usuario_id: req.params.id } });
            if (!u)
                return res.status(404).json({ message: 'User not found' });
            const { role } = req.body;
            if (!role)
                return res.status(400).json({ message: 'Missing role' });
            const r = await roleRepo.findOne({ where: { name: role } });
            if (!r)
                return res.status(404).json({ message: 'Role not found' });
            const roles = u.roles || [];
            if (!roles.includes(r.name))
                roles.push(r.name);
            u.roles = roles;
            await userRepo.save(u);
            res.json(u);
        });
        return router;
    }
    app.use('/roles', createTestRolesRouter());
    // incluir rota de congregações para testes
    function createTestCongregationsRouter() {
        const { Router } = require('express');
        const router = Router();
        router.get('/', async (req, res) => {
            const repo = testDataSource_1.TestDataSource.getRepository(Congregacao_1.Congregacao);
            const items = await repo.find();
            res.json(items);
        });
        router.post('/', async (req, res) => {
            const { nome, endereco, telefone, email, plano, website, cnpj, pastor_principal, limite_membros, limite_storage_mb, limite_mensagens_mes, ativo, data_fundacao, logo_url, configuracoes } = req.body;
            if (!nome)
                return res.status(400).json({ message: 'Missing nome' });
            const repo = testDataSource_1.TestDataSource.getRepository(Congregacao_1.Congregacao);
            const payload = { nome, endereco, telefone, email, plano };
            if (website !== undefined)
                payload.website = website;
            if (cnpj !== undefined)
                payload.cnpj = cnpj;
            if (pastor_principal !== undefined)
                payload.pastor_principal = pastor_principal;
            if (limite_membros !== undefined)
                payload.limite_membros = limite_membros;
            if (limite_storage_mb !== undefined)
                payload.limite_storage_mb = limite_storage_mb;
            if (limite_mensagens_mes !== undefined)
                payload.limite_mensagens_mes = limite_mensagens_mes;
            if (ativo !== undefined)
                payload.ativo = ativo;
            if (data_fundacao !== undefined)
                payload.data_fundacao = data_fundacao;
            if (logo_url !== undefined)
                payload.logo_url = logo_url;
            if (configuracoes !== undefined)
                payload.configuracoes = configuracoes;
            const c = repo.create(payload);
            await repo.save(c);
            res.status(201).json(c);
        });
        router.get('/:id', async (req, res) => {
            const repo = testDataSource_1.TestDataSource.getRepository(Congregacao_1.Congregacao);
            const c = await repo.findOne({ where: { congregacao_id: req.params.id } });
            if (!c)
                return res.status(404).json({ message: 'Not found' });
            res.json(c);
        });
        router.put('/:id', async (req, res) => {
            const repo = testDataSource_1.TestDataSource.getRepository(Congregacao_1.Congregacao);
            const c = await repo.findOne({ where: { congregacao_id: req.params.id } });
            if (!c)
                return res.status(404).json({ message: 'Not found' });
            const { nome, endereco, telefone, email, plano, website, cnpj, pastor_principal, limite_membros, limite_storage_mb, limite_mensagens_mes, ativo, data_fundacao, logo_url, configuracoes } = req.body;
            if (nome !== undefined)
                c.nome = nome;
            if (endereco !== undefined)
                c.endereco = endereco;
            if (telefone !== undefined)
                c.telefone = telefone;
            if (email !== undefined)
                c.email = email;
            if (plano !== undefined)
                c.plano = plano;
            if (website !== undefined)
                c.website = website;
            if (cnpj !== undefined)
                c.cnpj = cnpj;
            if (pastor_principal !== undefined)
                c.pastor_principal = pastor_principal;
            if (limite_membros !== undefined)
                c.limite_membros = limite_membros;
            if (limite_storage_mb !== undefined)
                c.limite_storage_mb = limite_storage_mb;
            if (limite_mensagens_mes !== undefined)
                c.limite_mensagens_mes = limite_mensagens_mes;
            if (ativo !== undefined)
                c.ativo = ativo;
            if (data_fundacao !== undefined)
                c.data_fundacao = data_fundacao;
            if (logo_url !== undefined)
                c.logo_url = logo_url;
            if (configuracoes !== undefined)
                c.configuracoes = configuracoes;
            await repo.save(c);
            res.json(c);
        });
        router.delete('/:id', async (req, res) => {
            const repo = testDataSource_1.TestDataSource.getRepository(Congregacao_1.Congregacao);
            await repo.delete({ congregacao_id: req.params.id });
            res.status(204).send();
        });
        return router;
    }
    app.use('/congregations', createTestCongregationsRouter());
    // roles already registered above
    return app;
}
