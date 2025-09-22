"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const testDataSource_1 = require("./helpers/testDataSource");
const testApp_1 = require("./helpers/testApp");
describe('Endpoints de Membros', () => {
    let app;
    beforeAll(async () => {
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
        await testDataSource_1.TestDataSource.synchronize(true);
    });
    describe('GET /members', () => {
        it('deve retornar lista vazia inicialmente', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/members')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(0);
        });
    });
    describe('POST /members', () => {
        it('deve criar um novo membro com sucesso', async () => {
            const memberData = {
                nome: 'João da Silva',
                cpf: '123.456.789-00',
                telefone: '(11) 99999-9999'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/members')
                .send(memberData)
                .expect(201);
            expect(response.body).toHaveProperty('membro_id');
            expect(response.body.nome).toBe(memberData.nome);
            expect(response.body.cpf).toBe(memberData.cpf);
            expect(response.body.telefone).toBe(memberData.telefone);
        });
        it('deve retornar erro para nome ausente', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/members')
                .send({ cpf: '123.456.789-00' })
                .expect(400);
            expect(response.body.message).toBe('Missing nome');
        });
    });
    describe('Integração GET e POST', () => {
        it('deve listar membro criado', async () => {
            // Criar membro
            const memberData = {
                nome: 'Maria Santos',
                telefone: '(11) 88888-8888'
            };
            await (0, supertest_1.default)(app)
                .post('/members')
                .send(memberData)
                .expect(201);
            // Listar membros
            const response = await (0, supertest_1.default)(app)
                .get('/members')
                .expect(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].nome).toBe(memberData.nome);
        });
    });
});
