import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { TestDataSource } from './helpers/testDataSource';

describe('Import route edge cases', () => {
  beforeAll(async () => {
    // TestDataSource já foi inicializado no jest.setup.ts
  });

  function mountImportRouter() {
    const dataSourceModule = require('../data-source');
    dataSourceModule.AppDataSource = TestDataSource;
    const importRouter = require('../routes/imports').default;
    const app = express();
    // Garantir que a congregacao do header exista no banco de teste (middleware deve rodar antes do router)
    app.use(async (req: any, _res: any, next: any) => {
      const cid = req.headers['x-congregacao-id'];
      if (cid) {
        const idVal = Array.isArray(cid) ? cid[0] : cid;
        const congRepo = TestDataSource.getRepository(require('../entities/Congregacao').Congregacao);
        let c = await congRepo.findOne({ where: { congregacao_id: idVal } as any });
        if (!c) {
          c = congRepo.create({ congregacao_id: idVal, nome: 'Test Congregacao ' + idVal });
          try { await congRepo.save(c); } catch (e) { /* ignore */ }
        }
      }
      next();
    });
    app.use((req: any, _res: any, next: any) => {
      req.user_id = req.headers['x-user-id'] || null;
      req.congregacao_id = req.headers['x-congregacao-id'] || null;
      next();
    });
    app.use('/import', importRouter);
    return app;
  }

  it('returns 400 when no file uploaded', async () => {
    const app = mountImportRouter();
    const res = await request(app)
      .post('/import/members')
      .set('x-user-id', '00000000-0000-0000-0000-00000000abcd')
      .set('x-congregacao-id', '00000000-0000-0000-0000-000000000003');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('skips rows without nome and creates only valid members with audit logs', async () => {
    const app = mountImportRouter();
    const csv = 'nome,cpf,telefone\nValid A,000.000.000-00,1111\n,222.222.222-22,2222\nValid B,333.333.333-33,3333\n';
    const tmp = path.join(__dirname, 'tmp_edge.csv');
    fs.writeFileSync(tmp, csv, 'utf8');

    const res = await request(app)
      .post('/import/members')
      .set('x-user-id', '00000000-0000-0000-0000-00000000abcd')
      .set('x-congregacao-id', '00000000-0000-0000-0000-000000000003')
      .attach('file', tmp);

    try { fs.unlinkSync(tmp); } catch {}

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('createdCount', 2);

    const auditRepo = TestDataSource.getRepository(require('../entities/AuditLog').AuditLog);
    const logs = await auditRepo.find({ where: { resource_type: 'members', action: 'CREATE' } as any });
    // At least 2 audit logs for the 2 created members
    expect(logs.length).toBeGreaterThanOrEqual(2);
  });

  it('allows duplicate rows and records audits for each', async () => {
    const app = mountImportRouter();
    const csv = 'nome,cpf,telefone\nDup,555.555.555-55,5555\nDup,555.555.555-55,5555\n';
    const tmp = path.join(__dirname, 'tmp_dup.csv');
    fs.writeFileSync(tmp, csv, 'utf8');

    const res = await request(app)
      .post('/import/members')
      .set('x-user-id', '00000000-0000-0000-0000-00000000abcd')
      .set('x-congregacao-id', '00000000-0000-0000-0000-000000000003')
      .attach('file', tmp);

    try { fs.unlinkSync(tmp); } catch {}

    expect(res.status).toBe(200);
    // One created, one skipped due to duplicate cpf
    expect(res.body).toHaveProperty('createdCount', 1);
    expect(res.body).toHaveProperty('skippedCount', 1);

    const memberRepo = TestDataSource.getRepository(require('../entities/Member').Member);
    const members = await memberRepo.find({ where: { nome: 'Dup' } as any });
    // Only one member should exist for the duplicated CPF
    expect(members.length).toBeGreaterThanOrEqual(1);
    expect(members.length).toBeLessThanOrEqual(1);

    const auditRepo = TestDataSource.getRepository(require('../entities/AuditLog').AuditLog);
    const createLogs = await auditRepo.find({ where: { resource_type: 'members', action: 'CREATE' } as any });
    const dupLogs = await auditRepo.find({ where: { resource_type: 'members', action: 'DUPLICATE_SKIPPED' } as any });
    // There should be one create and one duplicate-skipped audit
    expect(createLogs.length).toBeGreaterThanOrEqual(1);
    expect(dupLogs.length).toBeGreaterThanOrEqual(1);
  });

});
