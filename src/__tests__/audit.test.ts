// Definir DATABASE_URL ANTES de qualquer import que carregue AppDataSource
// Isso garante que o DataSource use Postgres e não SQLite
if (!process.env.DATABASE_URL) {
  // Fallback para testes locais sem script (não recomendado)
  process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5433/crm_test';
}

import request from 'supertest';
import app from '../index';
import { AppDataSource } from '../data-source';
import { AuditLog } from '../entities/AuditLog';
import { User } from '../entities/User';
import { Congregacao } from '../entities/Congregacao';
import { getTestJwt } from './helpers/auth';

describe('Auditoria - registro de ações', () => {
  let jwt: string;
  let memberId: string;

  beforeAll(async () => {
    // Garantir que DATABASE_URL está definida (esperado pelo script test_with_postgres.sh)
    if (!process.env.DATABASE_URL) {
      throw new Error('[audit.test] DATABASE_URL não definida - execute via npm test');
    }
    
    // Aguardar até que AppDataSource esteja pronto
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      // NÃO rodar migrations aqui - já foram executadas pelo script de teste
    }
    
    jwt = getTestJwt(); // Função síncrona
    
    // Limpar dados antigos do teste (se existirem)
    const congRepo = AppDataSource.getRepository(Congregacao);
    const userRepo = AppDataSource.getRepository(User);
    
    await userRepo.delete({ email: 'teste@teste.com' });
    await congRepo.delete({ congregacao_id: '38c5e7c4-dc05-4337-81b1-1a16152a3e27' });
    
    // Cria congregacao PRIMEIRO (para evitar violação de FK)
    await congRepo.save({
      congregacao_id: '38c5e7c4-dc05-4337-81b1-1a16152a3e27',
      nome: 'Cong Teste',
      ativo: true,
      plano: 'basico',
      limite_membros: 100,
      limite_storage_mb: 500,
      limite_mensagens_mes: 1000
    });
    
    // Cria usuário de teste para login
    const bcrypt = require('bcrypt');
    const senha_hash = await bcrypt.hash('123456', 10);
    await userRepo.save({
      usuario_id: '08ac05b3-7a23-4eff-b3e1-afebfd7e4c44',
      nome: 'Teste Audit',
      email: 'teste@teste.com',
      senha_hash,
      roles: ['admin'],
      ativo: true
    });
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('registra login com sucesso', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'teste@teste.com', senha: '123456' });
    // Não precisa validar token, só que houve registro
    const repo = AppDataSource.getRepository(AuditLog);
    const logs = await repo.find({ where: { action: 'LOGIN', resource_type: 'usuarios' } });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some(l => l.success)).toBe(true);
  });

  it('registra criação de membro', async () => {
    const res = await request(app)
      .post('/members')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ nome: 'Membro Audit', cpf: '', telefone: '' });
    expect(res.status).toBe(201);
    memberId = res.body.membro_id;
    const repo = AppDataSource.getRepository(AuditLog);
    const logs = await repo.find({ where: { action: 'CREATE', resource_type: 'members', resource_id: memberId } });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].new_values).toBeDefined();
  });

  it('registra upload de anexo', async () => {
    const res = await request(app)
      .post('/attachments')
      .set('Authorization', `Bearer ${jwt}`)
      .field('entity_type', 'membro')
      .field('entity_id', memberId)
      .attach('file', __dirname + '/fixtures/arquivo_teste.txt');
    expect(res.status).toBe(201);
    const repo = AppDataSource.getRepository(AuditLog);
    const logs = await repo.find({ where: { action: 'CREATE', resource_type: 'anexos', resource_id: res.body.id } });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].new_values).toBeDefined();
  });
});
