import 'reflect-metadata';
import { TestDataSource } from './src/__tests__/helpers/testDataSource';

// Setup do banco de dados para testes usando o TestDataSource
beforeAll(async () => {
  if (!TestDataSource.isInitialized) {
    await TestDataSource.initialize();
    
    // Se usando Postgres, garantir que o schema está limpo
    if (process.env.DATABASE_URL) {
      try {
        // Verificar se schema public existe, se não existir, criar
        const schemaResult = await TestDataSource.query(
          "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'public'"
        );
        
        if (schemaResult.length === 0) {
          await TestDataSource.query('CREATE SCHEMA public');
        }
        
        // Garantir extensão uuid-ossp
        await TestDataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        
        // Usar synchronize para criar tabelas
        await TestDataSource.synchronize(true);
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