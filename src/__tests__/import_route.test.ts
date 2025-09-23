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
    if (TestDataSource.isInitialized) await TestDataSource.destroy();
    await TestDataSource.initialize();
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  it('accepts multipart upload and records audits (real router)', async () => {
    // dynamically require modules so we can overwrite AppDataSource before router loads
    const dataSourceModule = require('../data-source');
    // Replace AppDataSource with TestDataSource for this test
    dataSourceModule.AppDataSource = TestDataSource;

    const importRouter = require('../routes/imports').default;

    const app = express();
    // simple headers middleware to simulate tenant and user
    app.use((req: any, _res: any, next: any) => {
      req.user_id = req.headers['x-user-id'] || null;
      req.congregacao_id = req.headers['x-congregacao-id'] || null;
      next();
    });
    app.use('/import', importRouter);

    // prepare temp CSV file
    const csv = 'nome,cpf,telefone\nRota Um,000.000.000-00,9999\nRota Dois,111.111.111-11,8888\n';
    const tmpPath = path.join(__dirname, 'tmp_members.csv');
    fs.writeFileSync(tmpPath, csv, 'utf8');

    const res = await request(app)
      .post('/import/members')
      .set('x-user-id', 'route-user-1')
      .set('x-congregacao-id', '00000000-0000-0000-0000-000000000002')
      .attach('file', tmpPath);

    // cleanup
    try { fs.unlinkSync(tmpPath); } catch {}

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('createdCount', 2);

    const auditRepo = TestDataSource.getRepository(require('../entities/AuditLog').AuditLog);
    const logs = await auditRepo.find({ where: { resource_type: 'members', action: 'CREATE' } as any });
    expect(logs.length).toBeGreaterThanOrEqual(2);
  });
});
