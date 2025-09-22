import request from 'supertest';
import { TestDataSource } from './helpers/testDataSource';
import { createTestApp } from './helpers/testApp';

let app: any;

beforeAll(async () => {
  if (!TestDataSource.isInitialized) await TestDataSource.initialize();
  app = await createTestApp();
});

afterAll(async () => {
  if (TestDataSource.isInitialized) await TestDataSource.destroy();
});

test('CRUD de congregações', async () => {
  const agent = request(app);

  // criar
  const createRes = await agent.post('/congregations').send({ nome: 'Igreja Exemplo' });
  expect(createRes.status).toBe(201);
  expect(createRes.body.nome).toBe('Igreja Exemplo');
  const id = createRes.body.congregacao_id;

  // buscar lista
  const listRes = await agent.get('/congregations');
  expect(listRes.status).toBe(200);
  expect(Array.isArray(listRes.body)).toBe(true);

  // buscar por id
  const getRes = await agent.get(`/congregations/${id}`);
  expect(getRes.status).toBe(200);
  expect(getRes.body.congregacao_id).toBe(id);

  // atualizar
  const updRes = await agent.put(`/congregations/${id}`).send({ telefone: '1234' });
  expect(updRes.status).toBe(200);
  expect(updRes.body.telefone).toBe('1234');

  // deletar
  const delRes = await agent.delete(`/congregations/${id}`);
  expect(delRes.status).toBe(204);
});
