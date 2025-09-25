import request from 'supertest'
import { createTestApp } from './helpers/testApp'
import { TestDataSource } from './helpers/testDataSource'

let app: import('express').Application;

beforeAll(() => {
  // jest.setup.ts já inicializa o TestDataSource
  app = createTestApp()
})

afterAll(() => {
  // jest.setup.ts irá destruir o TestDataSource ao final da suíte
})

describe('members update/delete with tenant isolation', () => {
  test('update and delete by same tenant succeeds', async () => {
    // create congregacao and member via test endpoints
  const cRes = await request(app).post('/congregations').send({ nome: 'C1' })
  expect(cRes.status).toBe(201)
  const cid = cRes.body.congregacao_id

    const mRes = await request(app)
      .post('/members')
      .set('x-congregacao-id', cid)
      .send({ nome: 'John', telefone: '123456789' })
  expect(mRes.status).toBe(201)
  const mid = mRes.body.membro_id

    const upd = await request(app)
      .put(`/members/${mid}`)
      .set('x-congregacao-id', cid)
      .send({ nome: 'Johnny' })
  expect(upd.status).toBe(200)
  expect(upd.body.nome).toBe('Johnny')

    const del = await request(app)
      .delete(`/members/${mid}`)
      .set('x-congregacao-id', cid)
  expect(del.status).toBe(204)
  })

  test('update and delete by other tenant is forbidden', async () => {
  const c1 = await request(app).post('/congregations').send({ nome: 'C-A' })
  const c2 = await request(app).post('/congregations').send({ nome: 'C-B' })
  const id1 = c1.body.congregacao_id
  const id2 = c2.body.congregacao_id

    const mRes = await request(app)
      .post('/members')
      .set('x-congregacao-id', id1)
      .send({ nome: 'Alice' })
  expect(mRes.status).toBe(201)
  const mid = mRes.body.membro_id

    const upd = await request(app)
      .put(`/members/${mid}`)
      .set('x-congregacao-id', id2)
      .send({ nome: 'ShouldNot' })
    expect(upd.status).toBe(403)

    const del = await request(app)
      .delete(`/members/${mid}`)
      .set('x-congregacao-id', id2)
    expect(del.status).toBe(403)
  })
})
