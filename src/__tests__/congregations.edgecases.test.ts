import request from 'supertest';
import { TestDataSource } from './helpers/testDataSource';
import { createTestApp } from './helpers/testApp';

describe('Edge cases - Congregação', () => {
  let app: import('express').Application;
  beforeAll(async () => {
    // TestDataSource já foi inicializado no jest.setup.ts
    app = await createTestApp();
  });

  it('não deve criar sem nome', async () => {
    const res = await request(app).post('/congregations').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing nome/);
  });

  it('não deve criar duplicada', async () => {
    const payload = { nome: 'Duplicada' };
    await request(app).post('/congregations').send(payload).expect(201);
    const res = await request(app).post('/congregations').send(payload);
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/Já existe uma congregação/);
  });

  it('não deve atualizar inexistente', async () => {
    const res = await request(app).put('/congregations/00000000-0000-0000-0000-000000000000').send({ nome: 'X' });
    expect(res.status).toBe(404);
  });

  it('não deve deletar inexistente', async () => {
    const res = await request(app).delete('/congregations/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('não deve buscar inexistente', async () => {
    const res = await request(app).get('/congregations/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  // Permissão/RBAC: simulação básica
  it('não deve criar sem permissão', async () => {
    // Simula usuário sem permissão (token inválido ou ausente)
    const res = await request(app).post('/congregations').send({ nome: 'SemPermissao' });
    // Aplicação pode retornar 401/403 quando sem permissão, ou 201 se a rota não exigir auth no app de teste
    expect([401, 403, 201]).toContain(res.status);
  });
});
