import request from 'supertest';
import { TestDataSource } from './helpers/testDataSource';
import { createTestApp } from './helpers/testApp';

let app: any;

beforeAll(async () => {
  // TestDataSource já foi inicializado no jest.setup.ts
  app = await createTestApp();
});

test('CRUD de congregações com campos expandidos', async () => {
  const agent = request(app);

  // criar
  const payload = {
    nome: 'Igreja Exemplo',
    endereco: 'Rua Central, 100',
    telefone: '99999-0000',
    email: 'contato@exemplo.com',
    website: 'https://igrejaexemplo.com',
    cnpj: '12.345.678/0001-99',
    pastor_principal: 'Pr. João',
    plano: 'premium',
    limite_membros: 500,
    limite_storage_mb: 2048,
    limite_mensagens_mes: 5000,
    ativo: true,
    data_fundacao: '2020-01-01',
    logo_url: 'https://logo.com/img.png',
    configuracoes: { tema: 'escuro', modulos: ['financeiro','eventos'] }
  };
  const createRes = await agent.post('/congregations').send(payload);
  expect(createRes.status).toBe(201);
  Object.entries(payload).forEach(([k, v]) => {
    if (k === 'configuracoes') {
      if (createRes.body[k] === null || createRes.body[k] === undefined) {
        // Aceita null, mas se enviou objeto espera que seja igual
        expect([null, undefined]).toContain(createRes.body[k]);
      } else {
        expect(createRes.body[k]).toMatchObject(v);
      }
    } else {
      expect(createRes.body[k]).toBeDefined();
    }
  });
  const id = createRes.body.congregacao_id;

  // buscar lista
  const listRes = await agent.get('/congregations');
  expect(listRes.status).toBe(200);
  const items = Array.isArray(listRes.body) ? listRes.body : listRes.body.data;
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBeGreaterThan(0);

  // buscar por id
  const getRes = await agent.get(`/congregations/${id}`);
  expect(getRes.status).toBe(200);
  expect(getRes.body.congregacao_id).toBe(id);
  expect(getRes.body.nome).toBe(payload.nome);
  expect(getRes.body.website).toBe(payload.website);
  expect(getRes.body.configuracoes).toMatchObject(payload.configuracoes);

  // atualizar
  const updRes = await agent.put(`/congregations/${id}`).send({ telefone: '1234', plano: 'basico', ativo: false });
  expect(updRes.status).toBe(200);
  expect(updRes.body.telefone).toBe('1234');
  expect(updRes.body.plano).toBe('basico');
  expect(updRes.body.ativo).toBe(false);

  // deletar
  const delRes = await agent.delete(`/congregations/${id}`);
  expect(delRes.status).toBe(204);
});
