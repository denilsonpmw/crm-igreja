import 'reflect-metadata';
import { DataSource } from 'typeorm';
// Importar entidades diretamente evita problemas com glob e extensões (.ts/.js)
import { User } from '../../entities/User';
import { UserSession } from '../../entities/UserSession';
import { Member } from '../../entities/Member';
import { Congregacao } from '../../entities/Congregacao';
import { Family } from '../../entities/Family';
import { Role } from '../../entities/Role';
import { AuditLog } from '../../entities/AuditLog';

// Criar lista de entidades fixa para evitar problemas com globs em testes
const entities = [User, UserSession, Member, Congregacao, Family, Role, AuditLog];

// Declarar a variável e atribuir condicionalmente
let _testDataSource: DataSource;

if (process.env.DATABASE_URL) {
  // Usar Postgres
  _testDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities
  });
} else {
  // DataSource específico para testes com banco em memória
  _testDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities
  });
}

export const TestDataSource = _testDataSource;