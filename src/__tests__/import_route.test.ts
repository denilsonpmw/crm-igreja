import request from 'supertest';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// We'll import TestDataSource and real router, but ensure the router uses TestDataSource by
// temporarily assigning AppDataSource to TestDataSource in the imported module's closure.
import { TestDataSource } from './helpers/testDataSource';

describe('Real /import/members route with TestDataSource', () => {
  beforeAll(async () => {
    // TestDataSource já foi inicializado no jest.setup.ts
  });

  it('accepts multipart upload and records audits (real router)', async () => {
    // dynamically require modules so we can overwrite AppDataSource before router loads
    const dataSourceModule = require('../data-source');
    // Replace AppDataSource with TestDataSource for this test
    dataSourceModule.AppDataSource = TestDataSource;

    const importRouter = require('../routes/imports').default;

    const app = express();
    // simple headers middleware to simulate tenant and user
    app.use((req: import('express').Request, _res: import('express').Response, next: import('express').NextFunction) => {
      const userIdHeader = req.headers['x-user-id'];
      req.user_id = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader || null;
      const congIdHeader = req.headers['x-congregacao-id'];
      req.congregacao_id = Array.isArray(congIdHeader) ? congIdHeader[0] : congIdHeader || null;
      next();
    });
    // ensure congregation exists for header
    const congRepo = TestDataSource.getRepository(require('../entities/Congregacao').Congregacao);
    const cid = '00000000-0000-0000-0000-000000000002';
    (async () => {
  let c = await congRepo.findOne({ where: { congregacao_id: cid } });
      if (!c) { c = congRepo.create({ congregacao_id: cid, nome: 'Test Cong 2' }); await congRepo.save(c); }
    })();
    app.use('/import', importRouter);

    // prepare temp CSV file
    const csv = 'nome,cpf,telefone\nRota Um,000.000.000-00,9999\nRota Dois,111.111.111-11,8888\n';
    const tmpPath = path.join(__dirname, 'tmp_members.csv');
    fs.writeFileSync(tmpPath, csv, 'utf8');

    const res = await request(app)
      .post('/import/members')
      .set('x-user-id', '00000000-0000-0000-0000-000000000002')
      .set('x-congregacao-id', '00000000-0000-0000-0000-000000000002')
      .attach('file', tmpPath);

    // cleanup
    try { fs.unlinkSync(tmpPath); } catch {}

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('createdCount', 2);

    const auditRepo = TestDataSource.getRepository(require('../entities/AuditLog').AuditLog);
  const logs = await auditRepo.find({ where: { resource_type: 'members', action: 'CREATE' } });
    expect(logs.length).toBeGreaterThanOrEqual(2);
  });
});
