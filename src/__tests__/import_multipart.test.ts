import request from 'supertest';
import express from 'express';
import multer from 'multer';
import { TestDataSource } from './helpers/testDataSource';
import { Member } from '../entities/Member';
import { AuditLog } from '../entities/AuditLog';

// Simple CSV parser copied from imports route
function parseCsv(content: string) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim());
    const obj: any = {};
    headers.forEach((h, i) => obj[h] = cols[i] || '');
    return obj;
  });
}

describe('Import multipart CSV -> members with audit', () => {
  beforeAll(async () => {
    // TestDataSource já foi inicializado no jest.setup.ts
  });

  it('imports CSV and creates audit entries', async () => {
    const app = express();

    // simple middleware to expose headers as req.user_id / req.congregacao_id
    app.use((req: any, _res: any, next: any) => {
      const uid = req.headers['x-user-id'];
      const cid = req.headers['x-congregacao-id'];
      req.user_id = Array.isArray(uid) ? uid[0] : uid;
      req.congregacao_id = Array.isArray(cid) ? cid[0] : cid;
      next();
    });

    const upload = multer({ storage: multer.memoryStorage() }).single('file');

    app.post('/import/members', (req: any, res: any) => {
      upload(req, res, async (err: any) => {
        if (err) return res.status(500).json({ message: 'Upload failed' });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        try {
          const content = req.file.buffer.toString('utf8');
          const rows = parseCsv(content);
          const memberRepo = TestDataSource.getRepository(Member);
          const auditRepo = TestDataSource.getRepository(AuditLog);
          const created: Partial<Member>[] = [];
          for (const r of rows) {
            const obj: any = {
              nome: r.nome || r.name || '',
              telefone: r.telefone || r.phone || undefined,
              cpf: r.cpf || undefined,
              congregacao_id: req.congregacao_id || null,
              created_by: req.user_id || null
            };
            if (!obj.nome) continue;
            const m = memberRepo.create(obj);
            const saved = await memberRepo.save(m);
            created.push(saved as Partial<Member>);
            // create audit
            const a = auditRepo.create({ user_id: req.user_id || null, congregacao_id: req.congregacao_id || null, action: 'CREATE', resource_type: 'members', resource_id: (saved as unknown as { membro_id: string }).membro_id, new_values: saved, success: true });
            await auditRepo.save(a);
          }
          res.json({ createdCount: created.length, created });
        } catch (e) {
          console.error(e);
          res.status(500).json({ message: 'Failed to import' });
        }
      });
    });

    const csv = 'nome,cpf,telefone\nImportado Um,000.000.000-00,1111\nImportado Dois,111.111.111-11,2222\n';

    // Garantir que a congregacao de teste exista
    const congRepo = TestDataSource.getRepository(require('../entities/Congregacao').Congregacao);
    const congId = '00000000-0000-0000-0000-000000000001';
  let existing = await congRepo.findOne({ where: { congregacao_id: congId } });
    if (!existing) {
      existing = congRepo.create({ congregacao_id: congId, nome: 'Test Congregacao 1' });
      await congRepo.save(existing);
    }

    const res = await request(app)
      .post('/import/members')
      .set('x-user-id', '00000000-0000-0000-0000-000000000001')
      .set('x-congregacao-id', '00000000-0000-0000-0000-000000000001')
      .attach('file', Buffer.from(csv), 'members.csv');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('createdCount', 2);

    const auditRepo = TestDataSource.getRepository(AuditLog);
  const logs = await auditRepo.find({ where: { resource_type: 'members', action: 'CREATE' } });
    expect(logs.length).toBeGreaterThanOrEqual(2);
    // ensure resource_id links to created members
    const createdIds = res.body.created.map((c: any) => c.membro_id);
    const idsFromLogs = logs.map(l => l.resource_id);
    for (const id of createdIds) {
      expect(idsFromLogs).toContain(id);
    }
  });
});
