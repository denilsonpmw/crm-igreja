import 'reflect-metadata';
import { TestDataSource } from './src/__tests__/helpers/testDataSource';

// Setup do banco de dados para testes usando o TestDataSource (in-memory)
beforeAll(async () => {
  if (!TestDataSource.isInitialized) {
    await TestDataSource.initialize();
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
    await TestDataSource.synchronize(true); // Drop e recriar schemas
  }
});