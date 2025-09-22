import { AppDataSource } from '../src/data-source';
import { User } from '../src/entities/User';
import { Role, Permission } from '../src/entities/Role';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');
    
    // Inicializar conexão
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexão com banco estabelecida');
    }

    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);

    // 1. Criar roles administrativas básicas
    console.log('📝 Criando roles administrativas...');
    
    const adminPermissions: Permission[] = [
      { resource: '*', action: '*' }
    ];

    const adminRole = roleRepo.create({
      name: 'admin',
      permissions: adminPermissions
    });

    const sedeAdminPermissions: Permission[] = [
      { resource: 'congregacoes', action: '*' },
      { resource: 'usuarios', action: '*' },
      { resource: 'roles', action: '*' },
      { resource: 'members', action: '*' }
    ];

    const sedeAdminRole = roleRepo.create({
      name: 'sede-admin',
      permissions: sedeAdminPermissions
    });

    const congregacaoAdminPermissions: Permission[] = [
      { resource: 'members', action: '*' },
      { resource: 'usuarios', action: 'read' }
    ];

    const congregacaoAdminRole = roleRepo.create({
      name: 'congregacao-admin',
      permissions: congregacaoAdminPermissions
    });

    const secretarioPermissions: Permission[] = [
      { resource: 'members', action: 'create' },
      { resource: 'members', action: 'read' },
      { resource: 'members', action: 'update' }
    ];

    const secretarioRole = roleRepo.create({
      name: 'secretario',
      permissions: secretarioPermissions
    });

    const tesoureiroPermissions: Permission[] = [
      { resource: 'finances', action: '*' },
      { resource: 'members', action: 'read' }
    ];

    const tesoureiroRole = roleRepo.create({
      name: 'tesoureiro',
      permissions: tesoureiroPermissions
    });

    // Salvar roles (verificar se já existem primeiro)
    const roles = [adminRole, sedeAdminRole, congregacaoAdminRole, secretarioRole, tesoureiroRole];
    
    for (const role of roles) {
      const existing = await roleRepo.findOne({ where: { name: role.name } });
      if (!existing) {
        await roleRepo.save(role);
        console.log(`✅ Role '${role.name}' criada`);
      } else {
        console.log(`⚠️  Role '${role.name}' já existe`);
      }
    }

    // 2. Criar usuário admin da sede
    console.log('👤 Criando usuário admin da sede...');
    
    const adminEmail = 'admin@sede.crm';
    const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = userRepo.create({
        nome: 'Administrador da Sede',
        email: adminEmail,
        senha_hash: hashedPassword,
        roles: ['admin', 'sede-admin'],
        ativo: true
      });

      await userRepo.save(adminUser);
      console.log('✅ Usuário admin da sede criado com sucesso!');
      console.log('📧 Email: admin@sede.crm');
      console.log('🔑 Senha: admin123');
    } else {
      console.log('⚠️  Usuário admin da sede já existe');
      console.log('📧 Email: admin@sede.crm');
    }

    // 3. Criar alguns usuários de teste
    console.log('👥 Criando usuários de teste...');
    
    const testUsers = [
      {
        nome: 'Pastor João Silva',
        email: 'pastor@congregacao1.crm',
        senha: 'pastor123',
        roles: ['congregacao-admin']
      },
      {
        nome: 'Maria Secretária',
        email: 'secretaria@congregacao1.crm',
        senha: 'secretaria123',
        roles: ['secretario']
      },
      {
        nome: 'Carlos Tesoureiro',
        email: 'tesoureiro@congregacao1.crm',
        senha: 'tesoureiro123',
        roles: ['tesoureiro']
      }
    ];

    for (const testUser of testUsers) {
      const existing = await userRepo.findOne({ where: { email: testUser.email } });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(testUser.senha, 10);
        
        const user = userRepo.create({
          nome: testUser.nome,
          email: testUser.email,
          senha_hash: hashedPassword,
          roles: testUser.roles,
          ativo: true
        });

        await userRepo.save(user);
        console.log(`✅ Usuário teste '${testUser.nome}' criado`);
      } else {
        console.log(`⚠️  Usuário '${testUser.nome}' já existe`);
      }
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Credenciais criadas:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ 🔐 ADMIN DA SEDE                                        │');
    console.log('│ Email: admin@sede.crm                                   │');
    console.log('│ Senha: admin123                                         │');
    console.log('│ Roles: admin, sede-admin                                │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ 👥 USUÁRIOS DE TESTE                                    │');
    console.log('│ Pastor: pastor@congregacao1.crm / pastor123             │');
    console.log('│ Secretária: secretaria@congregacao1.crm / secretaria123 │');
    console.log('│ Tesoureiro: tesoureiro@congregacao1.crm / tesoureiro123 │');
    console.log('└─────────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexão com banco encerrada');
    }
  }
}

// Executar seed se chamado diretamente
if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error('💥 Falha no seed:', error);
    process.exit(1);
  });
}

export { seedDatabase };