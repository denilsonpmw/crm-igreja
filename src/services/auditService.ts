import { AppDataSource } from '../data-source';
import { AuditLog } from '../entities/AuditLog';
import type { DeepPartial } from 'typeorm';

export async function recordAudit(entry: DeepPartial<AuditLog>) {
  const repo = AppDataSource.getRepository(AuditLog);
  const e = repo.create(entry);
  await repo.save(e);
  return e;
}
