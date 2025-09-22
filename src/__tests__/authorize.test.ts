import request from 'supertest';
import { createTestApp } from './helpers/testApp';
import { TestDataSource } from './helpers/testDataSource';

describe('authorize middleware integration', () => {
  let app: any;
  beforeAll(() => {
    app = createTestApp();
  });

  it('blocks write without proper role and allows with role', async () => {
    // create user
    const u = await request(app).post('/auth/register').send({ nome: 'AuthUser', email: 'auth@example.com', senha: '123456' });
    expect(u.status).toBe(201);
    const userId = u.body.id;

    // attempt to create member without role
    const res1 = await request(app).post('/members').set('x-user-id', userId).send({ nome: 'NoRole' });
    // expect forbidden because authorize checks user.roles and default is []
    expect(res1.status).toBe(403);

    // create role and assign
    await request(app).post('/roles/roles').send({ name: 'members:create' });
    await request(app).post(`/roles/users/${userId}/roles`).send({ role: 'members:create' });

    // now create member should succeed
    const res2 = await request(app).post('/members').set('x-user-id', userId).send({ nome: 'WithRole' });
    expect(res2.status).toBe(201);
  });

  it('respects congregation scope on permissions', async () => {
    // create user2
    const u = await request(app).post('/auth/register').send({ nome: 'ScopeUser', email: 'scope@example.com', senha: '123456' });
    expect(u.status).toBe(201);
    const userId = u.body.id;

    // create a role with permission scoped to congregation
    const role = await request(app).post('/roles/roles').send({ name: 'members:create:scoped', permissions: [{ resource: 'members', action: 'create', scope: 'congregation' }] });
    expect(role.status).toBe(201);

    // assign role
    await request(app).post(`/roles/users/${userId}/roles`).send({ role: 'members:create:scoped' });

    // attempt to create member WITHOUT congregacao header => should be forbidden
    const noScope = await request(app).post('/members').set('x-user-id', userId).send({ nome: 'NoCong' });
    expect(noScope.status).toBe(403);

    // with congregacao header should succeed
    const c = await request(app).post('/congregations').send({ nome: 'Scoped C' });
    expect(c.status).toBe(201);
    const cid = c.body.congregacao_id;

    const ok = await request(app).post('/members').set('x-user-id', userId).set('x-congregacao-id', cid).send({ nome: 'WithCong' });
    expect(ok.status).toBe(201);
  });

  it('supports own scope for updates', async () => {
    // create a user
    const u = await request(app).post('/auth/register').send({ nome: 'OwnUser', email: 'own@example.com', senha: '123456' });
    expect(u.status).toBe(201);
    const userId = u.body.id;

    // create role with own update permission and assign
  await request(app).post('/roles/roles').send({ name: 'members:update:own', permissions: [{ resource: 'members', action: 'update', scope: 'own' }] });
    await request(app).post(`/roles/users/${userId}/roles`).send({ role: 'members:update:own' });

  // also give create permission so the user can create their own member record
  await request(app).post('/roles/roles').send({ name: 'members:create', permissions: [{ resource: 'members', action: 'create', scope: 'all' }] });
  await request(app).post(`/roles/users/${userId}/roles`).send({ role: 'members:create' });

    // create a member as this user
    const created = await request(app).post('/members').set('x-user-id', userId).send({ nome: 'Owned', cpf: '000' });
    expect(created.status).toBe(201);
    const memberId = created.body.membro_id;

    // update should be allowed for owner
    const upd = await request(app).put(`/members/${memberId}`).set('x-user-id', userId).send({ nome: 'Owned Updated' });
    expect(upd.status).toBe(200);

    // create another user and try to update => should be forbidden
    const other = await request(app).post('/auth/register').send({ nome: 'OtherUser', email: 'other@example.com', senha: '123456' });
    const otherId = other.body.id;
    const bad = await request(app).put(`/members/${memberId}`).set('x-user-id', otherId).send({ nome: 'Hacker' });
    expect(bad.status).toBe(403);
  });
});
