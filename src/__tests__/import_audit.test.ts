import request from 'supertest';
import express from 'express';
import { TestDataSource } from './helpers/testDataSource';
import { AuditLog } from '../entities/AuditLog';

describe('Audit service and route', () => {
  beforeAll(async () => {
    // TestDataSource já foi inicializado no jest.setup.ts
  });

  it('creates and lists audit logs', async () => {
    const repo = TestDataSource.getRepository(AuditLog);
    // create a log entry
    const entry = repo.create({ user_id: null, congregacao_id: null, action: 'TEST', resource_type: 'members', resource_id: null, success: true });
    await repo.save(entry);

    const app = express();
    app.get('/audit/audit-logs', async (req, res) => {
  const items = await repo.find({ order: { created_at: 'DESC' } });
      res.json(items);
    });

    const res = await request(app).get('/audit/audit-logs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].action).toBe('TEST');
  });
});
