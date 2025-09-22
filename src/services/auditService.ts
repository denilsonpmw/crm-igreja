import { AppDataSource } from '../data-source';
import { AuditLog } from '../entities/AuditLog';

export async function recordAudit(entry: Partial<AuditLog>) {
  const repo = AppDataSource.getRepository(AuditLog);
  const e = repo.create(entry as any);
  await repo.save(e);
  return e;
}
