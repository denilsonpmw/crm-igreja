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
    if (req.congregacao_id)
        query.congregacao_id = req.congregacao_id;
    const members = await repo.find({ where: query });
    res.json(members);
});
router.post('/', (0, authorize_1.authorize)('members', 'create'), async (req, res) => {
    const { error, value } = memberCreateSchema.validate(req.body);
    if (error)
        return res.status(400).json({ message: error.message });
    const repo = data_source_1.AppDataSource.getRepository(Member_1.Member);
    const member = repo.create({ ...value, congregacao_id: req.congregacao_id || null, created_by: req.user_id || null });
    await repo.save(member);
    // audit
    try {
        await (0, auditService_1.recordAudit)({ user_id: req.user_id || undefined, congregacao_id: req.congregacao_id || undefined, action: 'CREATE', resource_type: 'members', resource_id: member.membro_id, new_values: member, success: true, ip_address: req.ip || undefined, user_agent: req.headers['user-agent'] || undefined, session_id: req.headers['x-session-id'] || undefined });
    }
    catch (e) {
        console.error('Audit error', e);
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
    if (req.congregacao_id && member.congregacao_id !== req.congregacao_id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(member, value);
    await repo.save(member);
    try {
        await (0, auditService_1.recordAudit)({ user_id: req.user_id || undefined, congregacao_id: req.congregacao_id || undefined, action: 'UPDATE', resource_type: 'members', resource_id: member.membro_id, new_values: member, success: true, ip_address: req.ip || undefined, user_agent: req.headers['user-agent'] || undefined, session_id: req.headers['x-session-id'] || undefined });
    }
    catch (e) {
        console.error('Audit error', e);
    }
    res.json(member);
});
// Delete member with tenant check
router.delete('/:id', (0, authorize_1.authorize)('members', 'delete'), async (req, res) => {
    const repo = data_source_1.AppDataSource.getRepository(Member_1.Member);
    const member = await repo.findOne({ where: { membro_id: req.params.id } });
    if (!member)
        return res.status(404).json({ message: 'Member not found' });
    if (req.congregacao_id && member.congregacao_id !== req.congregacao_id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    await repo.remove(member);
    try {
        await (0, auditService_1.recordAudit)({ user_id: req.user_id || undefined, congregacao_id: req.congregacao_id || undefined, action: 'DELETE', resource_type: 'members', resource_id: member.membro_id, old_values: member, success: true, ip_address: req.ip || undefined, user_agent: req.headers['user-agent'] || undefined, session_id: req.headers['x-session-id'] || undefined });
    }
    catch (e) {
        console.error('Audit error', e);
    }
    res.status(204).send();
});
exports.default = router;
