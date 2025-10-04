"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_source_1 = require("../data-source");
const Member_1 = require("../entities/Member");
const joi_1 = __importDefault(require("joi"));
const authorize_1 = require("../middlewares/authorize");
const auditService_1 = require("../services/auditService");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const memberCreateSchema = joi_1.default.object({
    nome: joi_1.default.string().min(1).required(),
    cpf: joi_1.default.string().allow('', null),
    telefone: joi_1.default.string().allow('', null),
}).unknown(true);
const memberUpdateSchema = joi_1.default.object({
    nome: joi_1.default.string().min(1),
    cpf: joi_1.default.string().allow('', null),
    telefone: joi_1.default.string().allow('', null),
}).unknown(true);
router.get('/', async (req, res) => {
    const repo = data_source_1.AppDataSource.getRepository(Member_1.Member);
    const query = {};
    const congregacaoId = req.congregacao_id;
    if (congregacaoId)
        query.congregacao_id = congregacaoId;
    const members = await repo.find({ where: query });
    res.json(members);
});
router.post('/', (0, authorize_1.authorize)('members', 'create'), async (req, res) => {
    const { error, value } = memberCreateSchema.validate(req.body);
    if (error)
        return res.status(400).json({ message: error.message });
    const repo = data_source_1.AppDataSource.getRepository(Member_1.Member);
    const congregacaoId = req.congregacao_id || null;
    const userId = req.user_id || null;
    const validated = value;
    const member = repo.create({ ...validated, congregacao_id: congregacaoId, created_by: userId });
    await repo.save(member);
    // audit
    try {
        await (0, auditService_1.recordAudit)({
            user_id: userId || undefined,
            congregacao_id: congregacaoId || undefined,
            action: 'CREATE',
            resource_type: 'members',
            resource_id: member.membro_id,
            new_values: member,
            success: true,
            ip_address: req.ip || undefined,
            user_agent: req.headers['user-agent'] || undefined,
            session_id: req.headers['x-session-id'] || undefined
        });
    }
    catch (e) {
        logger_1.logger.error('Audit error', e);
    }
    res.status(201).json(member);
});
// Update member with tenant check
router.put('/:id', (0, authorize_1.authorize)('members', 'update'), async (req, res) => {
    const { error, value } = memberUpdateSchema.validate(req.body);
    if (error)
        return res.status(400).json({ message: error.message });
    const repo = data_source_1.AppDataSource.getRepository(Member_1.Member);
    const member = await repo.findOne({ where: { membro_id: req.params.id } });
    if (!member)
        return res.status(404).json({ message: 'Member not found' });
    // tenant isolation: only allow update if member belongs to tenant
    const congregacaoId = req.congregacao_id;
    if (congregacaoId && member.congregacao_id !== congregacaoId) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(member, value);
    await repo.save(member);
    try {
        await (0, auditService_1.recordAudit)({
            user_id: req.user_id || undefined,
            congregacao_id: congregacaoId || undefined,
            action: 'UPDATE',
            resource_type: 'members',
            resource_id: member.membro_id,
            new_values: member,
            success: true,
            ip_address: req.ip || undefined,
            user_agent: req.headers['user-agent'] || undefined,
            session_id: req.headers['x-session-id'] || undefined
        });
    }
    catch (e) {
        logger_1.logger.error('Audit error', e);
    }
    res.json(member);
});
// Delete member with tenant check
router.delete('/:id', (0, authorize_1.authorize)('members', 'delete'), async (req, res) => {
    const repo = data_source_1.AppDataSource.getRepository(Member_1.Member);
    const member = await repo.findOne({ where: { membro_id: req.params.id } });
    if (!member)
        return res.status(404).json({ message: 'Member not found' });
    const congregacaoId = req.congregacao_id;
    if (congregacaoId && member.congregacao_id !== congregacaoId) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    await repo.remove(member);
    try {
        await (0, auditService_1.recordAudit)({
            user_id: req.user_id || undefined,
            congregacao_id: congregacaoId || undefined,
            action: 'DELETE',
            resource_type: 'members',
            resource_id: member.membro_id,
            old_values: member,
            success: true,
            ip_address: req.ip || undefined,
            user_agent: req.headers['user-agent'] || undefined,
            session_id: req.headers['x-session-id'] || undefined
        });
    }
    catch (e) {
        logger_1.logger.error('Audit error', e);
    }
    res.status(204).send();
});
exports.default = router;
