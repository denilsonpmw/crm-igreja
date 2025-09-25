import express from 'express';
import { AppDataSource } from '../data-source';
import { Member } from '../entities/Member';
import Joi from 'joi';
import { authorize } from '../middlewares/authorize';
import { recordAudit } from '../services/auditService';
import { logger } from '../utils/logger';
import type { FindOptionsWhere } from 'typeorm';

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
  const query: FindOptionsWhere<Member> = {} as FindOptionsWhere<Member>;
  const congregacaoId = (req as unknown as { congregacao_id?: string | null }).congregacao_id;
  if (congregacaoId) query.congregacao_id = congregacaoId;
  const members = await repo.find({ where: query });
  res.json(members);
});

router.post('/', authorize('members', 'create'), async (req, res) => {
  const { error, value } = memberCreateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const repo = AppDataSource.getRepository(Member);
  const congregacaoId = (req as unknown as { congregacao_id?: string | null }).congregacao_id || null;
  const userId = (req as unknown as { user_id?: string | null }).user_id || null;
  const validated = value as Partial<Member>;
  const member = repo.create({ ...validated, congregacao_id: congregacaoId, created_by: userId });
  await repo.save(member);
  // audit
  try {
    await recordAudit({
      user_id: userId || undefined,
      congregacao_id: congregacaoId || undefined,
      action: 'CREATE',
      resource_type: 'members',
      resource_id: member.membro_id,
      new_values: member,
      success: true,
      ip_address: req.ip || undefined,
      user_agent: (req.headers['user-agent'] as string) || undefined,
      session_id: (req.headers['x-session-id'] as string) || undefined
    });
  } catch (e) { logger.error('Audit error', e); }
  res.status(201).json(member);
});

// Update member with tenant check
router.put('/:id', authorize('members', 'update'), async (req, res) => {
  const { error, value } = memberUpdateSchema.validate(req.body)
  if (error) return res.status(400).json({ message: error.message });

  const repo = AppDataSource.getRepository(Member);
  const member = await repo.findOne({ where: { membro_id: req.params.id } as FindOptionsWhere<Member> })
  if (!member) return res.status(404).json({ message: 'Member not found' });

  // tenant isolation: only allow update if member belongs to tenant
  const congregacaoId = (req as unknown as { congregacao_id?: string | null }).congregacao_id;
  if (congregacaoId && member.congregacao_id !== congregacaoId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  Object.assign(member, value as Partial<Member>)
  await repo.save(member);
  try {
    await recordAudit({
      user_id: (req as unknown as { user_id?: string }).user_id || undefined,
      congregacao_id: congregacaoId || undefined,
      action: 'UPDATE',
      resource_type: 'members',
      resource_id: member.membro_id,
      new_values: member,
      success: true,
      ip_address: req.ip || undefined,
      user_agent: (req.headers['user-agent'] as string) || undefined,
      session_id: (req.headers['x-session-id'] as string) || undefined
    });
  } catch (e) { logger.error('Audit error', e); }
  res.json(member);
});

// Delete member with tenant check
router.delete('/:id', authorize('members', 'delete'), async (req, res) => {
  const repo = AppDataSource.getRepository(Member)
  const member = await repo.findOne({ where: { membro_id: req.params.id } as FindOptionsWhere<Member> })
  if (!member) return res.status(404).json({ message: 'Member not found' });

  const congregacaoId = (req as unknown as { congregacao_id?: string | null }).congregacao_id;
  if (congregacaoId && member.congregacao_id !== congregacaoId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await repo.remove(member);
  try {
    await recordAudit({
      user_id: (req as unknown as { user_id?: string }).user_id || undefined,
      congregacao_id: congregacaoId || undefined,
      action: 'DELETE',
      resource_type: 'members',
      resource_id: member.membro_id,
      old_values: member,
      success: true,
      ip_address: req.ip || undefined,
      user_agent: (req.headers['user-agent'] as string) || undefined,
      session_id: (req.headers['x-session-id'] as string) || undefined
    });
  } catch (e) { logger.error('Audit error', e); }
  res.status(204).send();
});

export default router;
