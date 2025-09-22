import 'reflect-metadata';
import { DataSource } from 'typeorm';
// Importar entidades diretamente evita problemas com glob e extensões (.ts/.js)
import { User } from '../../entities/User';
import { UserSession } from '../../entities/UserSession';
import { Member } from '../../entities/Member';
import { Congregacao } from '../../entities/Congregacao';
import { Role } from '../../entities/Role';
import { AuditLog } from '../../entities/AuditLog';

// DataSource específico para testes com banco em memória
export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: [User, UserSession, Member, Congregacao, Role, AuditLog]
});