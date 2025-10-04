
import express from 'express';
import { AppDataSource } from '../data-source';
import { Member } from '../entities/Member';
import Joi from 'joi';
import { authorize } from '../middlewares/authorize';
import { authMiddleware } from '../middlewares/auth';
import { recordAudit } from '../services/auditService';
import { logger } from '../utils/logger';
import type { FindOptionsWhere } from 'typeorm';

const router = express.Router();

const memberCreateSchema = Joi.object({
  nome: Joi.string().min(1).required(),
  cpf: Joi.string().allow('', null),
  telefone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  data_nascimento: Joi.date().allow('', null),
  sexo: Joi.string().valid('M', 'F').allow('', null),
  estado_civil: Joi.string().allow('', null),
  profissao: Joi.string().allow('', null),
  endereco: Joi.string().allow('', null),
  cep: Joi.string().allow('', null),
  cidade: Joi.string().allow('', null),
  estado: Joi.string().allow('', null),
  data_conversao: Joi.date().allow('', null),
  data_batismo: Joi.date().allow('', null),
  status: Joi.string().allow('', null),
  ministerios: Joi.array().items(Joi.string()).allow(null),
  observacoes: Joi.string().allow('', null),
  foto_url: Joi.string().allow('', null)
});

// Criação de membro individual
router.post('/', authMiddleware, authorize('members', 'create'), async (req, res) => {
  const { error, value } = memberCreateSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const repo = AppDataSource.getRepository(Member);
  const congregacaoId = (req as unknown as { congregacao_id?: string | null }).congregacao_id;
  
  const member = repo.create({ ...value, congregacao_id: congregacaoId });
  const savedMember = await repo.save(member);
  const memberObj = Array.isArray(savedMember) ? savedMember[0] : savedMember;

  try {
    await recordAudit({
      user_id: (req as unknown as { user_id?: string }).user_id || undefined,
      congregacao_id: congregacaoId || undefined,
      action: 'CREATE',
      resource_type: 'members',
      resource_id: memberObj.membro_id,
      new_values: memberObj,
      success: true,
      ip_address: req.ip || undefined,
      user_agent: (req.headers['user-agent'] as string) || undefined,
      session_id: (req.headers['x-session-id'] as string) || undefined
    });
  } catch (e) { logger.error('Audit error', e); }

  res.status(201).json(memberObj);
});


// Delete member with tenant check
router.delete('/:id', authMiddleware, authorize('members', 'delete'), async (req, res) => {
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
