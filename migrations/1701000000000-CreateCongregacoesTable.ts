import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCongregacoesTable1701000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid extension available
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS congregacoes (
        congregacao_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        nome varchar(255) NOT NULL,
        endereco text,
        telefone varchar(20),
        email varchar(255),
        website varchar(255),
        cnpj varchar(20),
        pastor_principal varchar(255),
        plano varchar(50) DEFAULT 'basico',
        limite_membros integer DEFAULT 100,
        limite_storage_mb integer DEFAULT 500,
        limite_mensagens_mes integer DEFAULT 1000,
        ativo boolean DEFAULT true,
        data_fundacao date,
        logo_url text,
        configuracoes jsonb DEFAULT '{}',
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS congregacoes`);
  }
}
