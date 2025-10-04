import 'reflect-metadata';
import { TestDataSource } from './src/__tests__/helpers/testDataSource';

// Setup do banco de dados para testes usando o TestDataSource
beforeAll(async () => {
  if (!TestDataSource.isInitialized) {
    await TestDataSource.initialize();
    
    // Se usando Postgres, NÃO usar synchronize pois as migrations já foram executadas
    if (process.env.DATABASE_URL) {
      try {
        // Garantir extensão uuid-ossp
        await TestDataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        
        // NÃO chamar synchronize aqui, pois as migrations já criaram as tabelas
        // await TestDataSource.synchronize(true); // REMOVIDO
      } catch (error) {
        console.warn('Warning during schema setup:', (error as Error).message);
      }
    }
  }
});

afterAll(async () => {
  if (TestDataSource.isInitialized) {
    await TestDataSource.destroy();
  }
});

// Limpar dados entre testes
afterEach(async () => {
  if (TestDataSource.isInitialized) {
    const entities = TestDataSource.entityMetadatas;
    
    if (process.env.DATABASE_URL) {
      // PostgreSQL - limpar com TRUNCATE ou DELETE
      try {
        // Desabilitar foreign key checks temporariamente
        await TestDataSource.query('SET session_replication_role = replica');
        
        for (const entity of entities) {
          await TestDataSource.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
        }
        
        // Reabilitar foreign key checks
        await TestDataSource.query('SET session_replication_role = DEFAULT');
      } catch (error) {
        // Se TRUNCATE falhar, usar DELETE
        try {
          for (const entity of entities.reverse()) {
            await TestDataSource.query(`DELETE FROM "${entity.tableName}"`);
          }
        } catch (deleteError) {
          console.warn('Failed to clean test data:', (deleteError as Error).message);
        }
      }
    } else {
      // SQLite - usar synchronize para recriar
      await TestDataSource.synchronize(true);
    }
  }
});