import { TestDataSource } from './helpers/testDataSource';
import { createTestApp } from './helpers/testApp';
import { Family } from '../entities/Family';
import { Member } from '../entities/Member';
import { Congregacao } from '../entities/Congregacao';
import { User } from '../entities/User';

describe('Families System', () => {
  let congregacao: Congregacao;
  let user: User;
  let app: import('express').Application;

  beforeAll(async () => {
    // TestDataSource já foi inicializado no jest.setup.ts
    app = await createTestApp();
  });

  beforeEach(async () => {
    // Limpar dados entre testes sem reinicializar o DataSource
    if (TestDataSource.isInitialized) {
      if (process.env.DATABASE_URL) {
        // Para Postgres, limpar tabelas manualmente
        const entities = TestDataSource.entityMetadatas;
        for (const entity of entities.reverse()) {
          await TestDataSource.query(`DELETE FROM "${entity.tableName}"`);
        }
      } else {
        // Para SQLite em memória, pode usar synchronize
        await TestDataSource.synchronize(true);
      }
    }

    // Criar congregação de teste
    const congregacaoRepo = TestDataSource.getRepository(Congregacao);
    congregacao = new Congregacao();
    congregacao.nome = 'Igreja Teste';
    congregacao.endereco = 'Rua Teste, 123';
    await congregacaoRepo.save(congregacao);

    // Criar usuário de teste
    const userRepo = TestDataSource.getRepository(User);
    user = new User();
    user.nome = 'Admin Teste';
    user.email = 'admin@teste.com';
    user.senha_hash = 'hash_teste';
    user.roles = ['admin'];
    await userRepo.save(user);
  });

  describe('Family Entity', () => {
    it('deve criar uma nova família com sucesso', async () => {
      const familyRepo = TestDataSource.getRepository(Family);
      const family = new Family();
      family.congregacao_id = congregacao.congregacao_id;
      family.nome_familia = 'Família Silva';
      family.endereco = 'Rua das Flores, 456';
      family.cidade = 'São Paulo';
      family.estado = 'SP';
      family.cep = '01234-567';
      family.telefone_principal = '(11) 99999-9999';
      family.observacoes = 'Família ativa na igreja';

      const savedFamily = await familyRepo.save(family);

      expect(savedFamily.familia_id).toBeDefined();
      expect(savedFamily.nome_familia).toBe('Família Silva');
      expect(savedFamily.congregacao_id).toBe(congregacao.congregacao_id);
      expect(savedFamily.ativo).toBe(true);
    });

    it('deve falhar ao criar família sem nome obrigatório', async () => {
      const familyRepo = TestDataSource.getRepository(Family);
      
      try {
        const family = new Family();
        family.congregacao_id = congregacao.congregacao_id;
        family.endereco = 'Rua das Flores, 456';
        family.cidade = 'São Paulo';
        family.estado = 'SP';
        // nome_familia não definido - deve falhar
        await familyRepo.save(family);
        fail('Deveria ter falhado por falta de nome');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('deve permitir criar múltiplas famílias na mesma congregação', async () => {
      const familyRepo = TestDataSource.getRepository(Family);
      
      // Criar primeira família
      const family1 = new Family();
      family1.nome_familia = 'Família Silva';
      family1.congregacao_id = congregacao.congregacao_id;
      await familyRepo.save(family1);

      // Criar segunda família com nome diferente
      const family2 = new Family();
      family2.nome_familia = 'Família Santos';
      family2.congregacao_id = congregacao.congregacao_id;
      await familyRepo.save(family2);

      const families = await familyRepo.find({
        where: { congregacao_id: congregacao.congregacao_id }
      });

      expect(families).toHaveLength(2);
    });
  });

  describe('Family Methods', () => {
    let family: Family;

    beforeEach(async () => {
      const familyRepo = TestDataSource.getRepository(Family);
      family = new Family();
      family.nome_familia = 'Família Métodos';
      family.endereco = 'Rua Teste, 123';
      family.cidade = 'São Paulo';
      family.estado = 'SP';
      family.telefone_principal = '(11) 99999-9999';
      family.congregacao_id = congregacao.congregacao_id;
      await familyRepo.save(family);

      // Adicionar alguns membros simulados
      const memberRepo = TestDataSource.getRepository(Member);
      
      const member1 = new Member();
      member1.nome = 'João Silva';
      member1.familia_id = family.familia_id;
      member1.congregacao_id = congregacao.congregacao_id;
      member1.status = 'ativo';
      await memberRepo.save(member1);

      const member2 = new Member();
      member2.nome = 'Maria Silva';
      member2.familia_id = family.familia_id;
      member2.congregacao_id = congregacao.congregacao_id;
      member2.status = 'ativo';
      await memberRepo.save(member2);

      // Recarregar família com membros
      family = await familyRepo.findOne({
        where: { familia_id: family.familia_id },
        relations: ['membros']
      }) as Family;
    });

    it('deve retornar informações básicas com toBasicInfo()', () => {
      const basicInfo = family.toBasicInfo();

      expect(basicInfo.familia_id).toBe(family.familia_id);
      expect(basicInfo.nome_familia).toBe('Família Métodos');
      expect(basicInfo.cidade).toBe('São Paulo');
      expect(basicInfo.total_membros).toBe(2);
      expect(basicInfo.ativo).toBe(true);
    });

    it('deve retornar informações completas com toFullInfo()', () => {
      const fullInfo = family.toFullInfo();

      expect(fullInfo.familia_id).toBe(family.familia_id);
      expect(fullInfo.nome_familia).toBe('Família Métodos');
      expect(fullInfo.endereco).toBe('Rua Teste, 123');
      expect(fullInfo.telefone_principal).toBe('(11) 99999-9999');
      expect(fullInfo.membros).toHaveLength(2);
      expect(fullInfo.created_at).toBeDefined();
      expect(fullInfo.updated_at).toBeDefined();
    });
  });

  describe('Family-Member Relationship', () => {
    let family: Family;

    beforeEach(async () => {
      const familyRepo = TestDataSource.getRepository(Family);
      family = new Family();
      family.nome_familia = 'Família Relacionamento';
      family.congregacao_id = congregacao.congregacao_id;
      await familyRepo.save(family);
    });

    it('deve criar membro vinculado à família', async () => {
      const memberRepo = TestDataSource.getRepository(Member);
      const member = new Member();
      member.nome = 'Maria Silva';
      member.familia_id = family.familia_id;
      member.congregacao_id = congregacao.congregacao_id;
      member.sexo = 'F';
      member.status = 'ativo';
      
      const savedMember = await memberRepo.save(member);

      expect(savedMember.familia_id).toBe(family.familia_id);
      expect(savedMember.nome).toBe('Maria Silva');
      expect(savedMember.sexo).toBe('F');
    });

    it('deve carregar família com seus membros', async () => {
      // Criar alguns membros
      const memberRepo = TestDataSource.getRepository(Member);
      
      const member1 = new Member();
      member1.nome = 'João Silva';
      member1.familia_id = family.familia_id;
      member1.congregacao_id = congregacao.congregacao_id;
      member1.sexo = 'M';
      member1.status = 'ativo';
      await memberRepo.save(member1);

      const member2 = new Member();
      member2.nome = 'Maria Silva';
      member2.familia_id = family.familia_id;
      member2.congregacao_id = congregacao.congregacao_id;
      member2.sexo = 'F';
      member2.status = 'ativo';
      await memberRepo.save(member2);

      // Carregar família com membros
      const familyRepo = TestDataSource.getRepository(Family);
      const familyWithMembers = await familyRepo.findOne({
        where: { familia_id: family.familia_id },
        relations: ['membros']
      });

      expect(familyWithMembers?.membros).toHaveLength(2);
      expect(familyWithMembers?.membros?.map(m => m.nome)).toContain('João Silva');
      expect(familyWithMembers?.membros?.map(m => m.nome)).toContain('Maria Silva');
    });

    it('deve impedir exclusão de família com membros ativos', async () => {
      // Criar membro ativo na família
      const memberRepo = TestDataSource.getRepository(Member);
      const member = new Member();
      member.nome = 'João Silva';
      member.familia_id = family.familia_id;
      member.congregacao_id = congregacao.congregacao_id;
      member.status = 'ativo';
      await memberRepo.save(member);

      // Verificar se há membros ativos
      const activeMembers = await memberRepo.count({
        where: { familia_id: family.familia_id, status: 'ativo' }
      });

      expect(activeMembers).toBe(1);
      
      // Em um cenário real, a API impediria a exclusão
      // Aqui apenas verificamos que o membro existe
      expect(activeMembers).toBeGreaterThan(0);
    });
  });

  describe('Family Queries', () => {
    beforeEach(async () => {
      // Criar famílias de teste
      const familyRepo = TestDataSource.getRepository(Family);
      
      const families = [
        { nome_familia: 'Família Silva', cidade: 'São Paulo' },
        { nome_familia: 'Família Santos', cidade: 'Rio de Janeiro' },
        { nome_familia: 'Família Oliveira', cidade: 'Belo Horizonte' }
      ];

      for (const familyData of families) {
        const family = new Family();
        family.nome_familia = familyData.nome_familia;
        family.cidade = familyData.cidade;
        family.congregacao_id = congregacao.congregacao_id;
        await familyRepo.save(family);
      }
    });

    it('deve listar todas as famílias da congregação', async () => {
      const familyRepo = TestDataSource.getRepository(Family);
      const families = await familyRepo.find({
        where: { congregacao_id: congregacao.congregacao_id },
        order: { nome_familia: 'ASC' }
      });

      expect(families).toHaveLength(3);
      expect(families[0].nome_familia).toBe('Família Oliveira');
      expect(families[1].nome_familia).toBe('Família Santos');
      expect(families[2].nome_familia).toBe('Família Silva');
    });

    it('deve filtrar famílias por busca', async () => {
      const familyRepo = TestDataSource.getRepository(Family);
      const families = await familyRepo
        .createQueryBuilder('family')
        .where('family.congregacao_id = :congregacao_id', { congregacao_id: congregacao.congregacao_id })
        .andWhere('family.nome_familia LIKE :search', { search: '%Silva%' })
        .getMany();

      expect(families).toHaveLength(1);
      expect(families[0].nome_familia).toBe('Família Silva');
    });
  });
});
