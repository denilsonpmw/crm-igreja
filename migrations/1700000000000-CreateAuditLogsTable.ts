import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogsTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela de audit logs primeiro (sem dependências)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid,
        congregacao_id uuid,
        action varchar(50) NOT NULL,
        resource_type varchar(50) NOT NULL,
        resource_id uuid,
        old_values jsonb,
        new_values jsonb,
        ip_address inet,
        user_agent text,
        success boolean DEFAULT true,
        error_message text,
        created_at timestamp DEFAULT now()
      )
    `);

    // Criar tabela de usuários
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        usuario_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome varchar(255) NOT NULL,
        email varchar(255) UNIQUE NOT NULL,
        senha_hash varchar(255) NOT NULL,
        congregacao_id uuid,
        roles text[] NOT NULL DEFAULT '{}',
        avatar_url text,
        telefone varchar(20),
        ultimo_login timestamp,
        ativo boolean DEFAULT true,
        email_verificado boolean DEFAULT false,
        reset_token varchar(255),
        reset_token_expiry timestamp,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    // Criar tabela de sessões de usuário
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        session_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
        congregacao_id uuid,
        refresh_token_hash varchar(255) NOT NULL,
        device_info jsonb,
        ip_address inet,
        expires_at timestamp NOT NULL,
        revoked boolean DEFAULT false,
        created_at timestamp DEFAULT now()
      )
    `);

    // Criar tabela de roles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(100) NOT NULL,
        permissions jsonb DEFAULT '[]',
        description text,
        active boolean DEFAULT true,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS roles`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_sessions`);
    await queryRunner.query(`DROP TABLE IF EXISTS usuarios`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs`);
  }
}