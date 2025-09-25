import express from 'express';
import { AppDataSource } from '../data-source';
import { AuditLog } from '../entities/AuditLog';
import type { FindOptionsWhere } from 'typeorm';

const router = express.Router();

// GET /audit-logs?resource_type=members&user_id=...
router.get('/audit-logs', async (req, res) => {
  const repo = AppDataSource.getRepository(AuditLog);
  const query: FindOptionsWhere<AuditLog> = {} as FindOptionsWhere<AuditLog>;
  if (req.query.resource_type) query.resource_type = String(req.query.resource_type);
  if (req.query.user_id) query.user_id = String(req.query.user_id);
  if (req.query.congregacao_id) query.congregacao_id = String(req.query.congregacao_id);
  const logs = await repo.find({ where: query, order: { created_at: 'DESC' } });
  res.json(logs);
});

export default router;
