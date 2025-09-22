import request from 'supertest';
import { TestDataSource } from './helpers/testDataSource';
import { createTestApp } from './helpers/testApp';

describe('Endpoints de Autenticação', () => {
  let app: any;

  beforeAll(async () => {
    // Inicializar DataSource de teste
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    app = createTestApp();
  });

  afterAll(async () => {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Limpar dados entre testes
    await TestDataSource.synchronize(true);
  });

  describe('POST /auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const userData = {
        nome: 'Teste Usuario',
        email: 'teste@exemplo.com',
        senha: '123456'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(userData.nome);
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty('senha_hash');
    });

    it('deve retornar erro para email já existente', async () => {
      const userData = {
        nome: 'Teste Usuario',
        email: 'teste@exemplo.com',
        senha: '123456'
      };

      // Primeiro registro
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Segundo registro com mesmo email
      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.message).toBe('Email already in use');
    });

    it('deve retornar erro para campos obrigatórios ausentes', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ nome: 'Teste' })
        .expect(400);

      expect(response.body.message).toBe('Missing fields');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Criar usuário para testes de login
      await request(app)
        .post('/auth/register')
        .send({
          nome: 'Teste Usuario',
          email: 'teste@exemplo.com',
          senha: '123456'
        });
    });

    it('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'teste@exemplo.com',
          senha: '123456'
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
    });

    it('deve retornar erro para credenciais inválidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'teste@exemplo.com',
          senha: 'senhaerrada'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('deve retornar erro para usuário inexistente', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'inexistente@exemplo.com',
          senha: '123456'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Registrar e fazer login para obter refresh token
      await request(app)
        .post('/auth/register')
        .send({
          nome: 'Teste Usuario',
          email: 'teste@exemplo.com',
          senha: '123456'
        });

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'teste@exemplo.com',
          senha: '123456'
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('deve renovar tokens com refresh token válido', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      // Novo refresh token deve ser diferente (rotação)
      expect(response.body.refreshToken).not.toBe(refreshToken);
    });

    it('deve retornar erro para refresh token inválido', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'token_invalido' })
        .expect(401);

      expect(response.body.message).toBe('Invalid refresh token');
    });
  });

  describe('POST /auth/logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Registrar e fazer login para obter refresh token
      await request(app)
        .post('/auth/register')
        .send({
          nome: 'Teste Usuario',
          email: 'teste@exemplo.com',
          senha: '123456'
        });

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'teste@exemplo.com',
          senha: '123456'
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('deve fazer logout com sucesso', async () => {
      await request(app)
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Tentar usar o refresh token após logout deve falhar
      await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });
});