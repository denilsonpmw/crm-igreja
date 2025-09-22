"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testDataSource_1 = require("./helpers/testDataSource");
const testApp_1 = require("./helpers/testApp");
describe('Endpoints de Autenticação', () => {
    let app;
    beforeAll(async () => {
        // Inicializar DataSource de teste
        if (!testDataSource_1.TestDataSource.isInitialized) {
            await testDataSource_1.TestDataSource.initialize();
        }
        app = (0, testApp_1.createTestApp)();
    });
    afterAll(async () => {
        if (testDataSource_1.TestDataSource.isInitialized) {
            await testDataSource_1.TestDataSource.destroy();
        }
    });
    beforeEach(async () => {
        // Limpar dados entre testes
        await testDataSource_1.TestDataSource.synchronize(true);
    });
    describe('POST /auth/register', () => {
        it('deve registrar um novo usuário com sucesso', async () => {
            const userData = {
                nome: 'Teste Usuario',
                email: 'teste@exemplo.com',
                senha: '123456'
            };
            const response = await (0, supertest_1.default)(app)
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
            await (0, supertest_1.default)(app)
                .post('/auth/register')
                .send(userData)
                .expect(201);
            // Segundo registro com mesmo email
            const response = await (0, supertest_1.default)(app)
                .post('/auth/register')
                .send(userData)
                .expect(409);
            expect(response.body.message).toBe('Email already in use');
        });
        it('deve retornar erro para campos obrigatórios ausentes', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/auth/register')
                .send({ nome: 'Teste' })
                .expect(400);
            expect(response.body.message).toBe('Missing fields');
        });
    });
    describe('POST /auth/login', () => {
        beforeEach(async () => {
            // Criar usuário para testes de login
            await (0, supertest_1.default)(app)
                .post('/auth/register')
                .send({
                nome: 'Teste Usuario',
                email: 'teste@exemplo.com',
                senha: '123456'
            });
        });
        it('deve fazer login com credenciais válidas', async () => {
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
                .post('/auth/login')
                .send({
                email: 'teste@exemplo.com',
                senha: 'senhaerrada'
            })
                .expect(401);
            expect(response.body.message).toBe('Invalid credentials');
        });
        it('deve retornar erro para usuário inexistente', async () => {
            const response = await (0, supertest_1.default)(app)
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
        let refreshToken;
        beforeEach(async () => {
            // Registrar e fazer login para obter refresh token
            await (0, supertest_1.default)(app)
                .post('/auth/register')
                .send({
                nome: 'Teste Usuario',
                email: 'teste@exemplo.com',
                senha: '123456'
            });
            const loginResponse = await (0, supertest_1.default)(app)
                .post('/auth/login')
                .send({
                email: 'teste@exemplo.com',
                senha: '123456'
            });
            refreshToken = loginResponse.body.refreshToken;
        });
        it('deve renovar tokens com refresh token válido', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/auth/refresh')
                .send({ refreshToken })
                .expect(200);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            // Novo refresh token deve ser diferente (rotação)
            expect(response.body.refreshToken).not.toBe(refreshToken);
        });
        it('deve retornar erro para refresh token inválido', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/auth/refresh')
                .send({ refreshToken: 'token_invalido' })
                .expect(401);
            expect(response.body.message).toBe('Invalid refresh token');
        });
    });
    describe('POST /auth/logout', () => {
        let refreshToken;
        beforeEach(async () => {
            // Registrar e fazer login para obter refresh token
            await (0, supertest_1.default)(app)
                .post('/auth/register')
                .send({
                nome: 'Teste Usuario',
                email: 'teste@exemplo.com',
                senha: '123456'
            });
            const loginResponse = await (0, supertest_1.default)(app)
                .post('/auth/login')
                .send({
                email: 'teste@exemplo.com',
                senha: '123456'
            });
            refreshToken = loginResponse.body.refreshToken;
        });
        it('deve fazer logout com sucesso', async () => {
            await (0, supertest_1.default)(app)
                .post('/auth/logout')
                .send({ refreshToken })
                .expect(200);
            // Tentar usar o refresh token após logout deve falhar
            await (0, supertest_1.default)(app)
                .post('/auth/refresh')
                .send({ refreshToken })
                .expect(401);
        });
    });
});
