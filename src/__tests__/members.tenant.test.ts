import request from 'supertest';
import { createTestApp } from './helpers/testApp';
import { TestDataSource } from './helpers/testDataSource';

describe('members tenant isolation', () => {
  it('should isolate members by congregacao_id header', async () => {
    const app = createTestApp();

    const tenantA = '123e4567-e89b-12d3-a456-426614174000';
    const tenantB = '223e4567-e89b-12d3-a456-426614174000';

    // create member in tenant A
    await request(app)
      .post('/members')
      .set('x-congregacao-id', tenantA)
      .send({ nome: 'Alice' })
      .expect(201);

    // create member in tenant B
    await request(app)
      .post('/members')
      .set('x-congregacao-id', tenantB)
      .send({ nome: 'Bob' })
      .expect(201);

    // tenant A should only see Alice
    const resA = await request(app)
      .get('/members')
      .set('x-congregacao-id', tenantA)
      .expect(200);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].nome).toBe('Alice');

    // tenant B should only see Bob
    const resB = await request(app)
      .get('/members')
      .set('x-congregacao-id', tenantB)
      .expect(200);
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].nome).toBe('Bob');

    // no header should see all (since our test app doesn't set global tenant)
    const resAll = await request(app)
      .get('/members')
      .expect(200);
    expect(resAll.body.length).toBeGreaterThanOrEqual(2);
  });
});
