import express from 'express';
import { AppDataSource } from '../data-source';
import { Member } from '../entities/Member';
import Joi from 'joi';
import { authorize } from '../middlewares/authorize';
import { recordAudit } from '../services/auditService';

const router = express.Router();

const memberCreateSchema = Joi.object({
  nome: Joi.string().min(1).required(),
  cpf: Joi.string().allow('', null),
  telefone: Joi.string().allow('', null),
}).unknown(true);

const memberUpdateSchema = Joi.object({
  nome: Joi.string().min(1),
  cpf: Joi.string().allow('', null),
  telefone: Joi.string().allow('', null),
}).unknown(true);

router.get('/', async (req, res) => {
  const repo = AppDataSource.getRepository(Member);
  const query: any = {};
  if (req.congregacao_id) query.congregacao_id = req.congregacao_id;
  const members = await repo.find({ where: query });
  res.json(members);
});

router.post('/', authorize('members', 'create'), async (req, res) => {
  const { error, value } = memberCreateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const repo = AppDataSource.getRepository(Member);
  const member = repo.create({ ...value, congregacao_id: req.congregacao_id || null, created_by: req.user_id || null });
  await repo.save(member);
  // audit
  try { await recordAudit({ user_id: req.user_id || null, congregacao_id: req.congregacao_id || null, action: 'CREATE', resource_type: 'members', resource_id: (member as any).membro_id, new_values: member, success: true }); } catch (e) { console.error('Audit error', e); }
  res.status(201).json(member);
});

// Update member with tenant check
router.put('/:id', authorize('members', 'update'), async (req, res) => {
  const { error, value } = memberUpdateSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.message });

  const repo = AppDataSource.getRepository(Member);
  const member = await repo.findOne({ where: { membro_id: req.params.id } as any })
  if (!member) return res.status(404).json({ message: 'Member not found' });

  // tenant isolation: only allow update if member belongs to tenant
  if (req.congregacao_id && member.congregacao_id !== req.congregacao_id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  Object.assign(member, value)
  await repo.save(member);
  try { await recordAudit({ user_id: req.user_id || null, congregacao_id: req.congregacao_id || null, action: 'UPDATE', resource_type: 'members', resource_id: (member as any).membro_id, new_values: member, success: true }); } catch (e) { console.error('Audit error', e); }
  res.json(member);
});

// Delete member with tenant check
router.delete('/:id', authorize('members', 'delete'), async (req, res) => {
  const repo = AppDataSource.getRepository(Member)
  const member = await repo.findOne({ where: { membro_id: req.params.id } as any })
  if (!member) return res.status(404).json({ message: 'Member not found' });

  if (req.congregacao_id && member.congregacao_id !== req.congregacao_id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await repo.remove(member);
  try { await recordAudit({ user_id: req.user_id || null, congregacao_id: req.congregacao_id || null, action: 'DELETE', resource_type: 'members', resource_id: (member as any).membro_id, old_values: member, success: true }); } catch (e) { console.error('Audit error', e); }
  res.status(204).send();
});

export default router;
