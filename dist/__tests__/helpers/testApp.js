"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestApp = createTestApp;
const express_1 = __importDefault(require("express"));
const testDataSource_1 = require("./testDataSource");
const User_1 = require("../../entities/User");
const UserSession_1 = require("../../entities/UserSession");
const Member_1 = require("../../entities/Member");
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
    router.get('/', async (req, res) => {
        const repo = testDataSource_1.TestDataSource.getRepository(Member_1.Member);
        const items = await repo.find();
        res.json(items);
    });
    router.post('/', async (req, res) => {
        const { nome, cpf, telefone } = req.body;
        if (!nome)
            return res.status(400).json({ message: 'Missing nome' });
        const repo = testDataSource_1.TestDataSource.getRepository(Member_1.Member);
        const m = repo.create({ nome, cpf, telefone });
        await repo.save(m);
        res.status(201).json(m);
    });
    return router;
}
function createTestApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    // Rotas de teste
    app.use('/auth', createTestAuthRouter());
    app.use('/members', createTestMembersRouter());
    return app;
}
