import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set — falling back to SQLite dev database at ./dev.sqlite');
}

const isPostgres = !!process.env.DATABASE_URL;

// Determinar se estamos em ambiente de desenvolvimento ou produção
const isDevelopment = process.env.NODE_ENV !== 'production';
const entityExtension = isDevelopment ? 'ts' : 'js';

export const AppDataSource = new DataSource(
  isPostgres
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        synchronize: true,
        logging: false,
        entities: [path.join(__dirname, 'entities', `*.${entityExtension}`)],
        migrations: [
          path.join(__dirname, 'migrations', `*.${entityExtension}`),
          path.join(process.cwd(), 'migrations', `*.${entityExtension}`),
        ]
      }
    : {
        type: 'sqlite',
        database: path.join(process.cwd(), 'dev.sqlite'),
        synchronize: true,
        logging: false,
        entities: [path.join(__dirname, 'entities', `*.${entityExtension}`)]
      } as any
);
