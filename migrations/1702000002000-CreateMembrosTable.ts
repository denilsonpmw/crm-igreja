import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMembrosTable1702000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS membros (
        membro_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        congregacao_id uuid REFERENCES congregacoes(congregacao_id),
        familia_id uuid REFERENCES familias(familia_id),
        nome varchar(255) NOT NULL,
        cpf varchar(14),
        data_nascimento date,
        sexo char(1) CHECK (sexo IN ('M', 'F')),
        estado_civil varchar(20),
        profissao varchar(100),
        telefone varchar(20),
        email varchar(255),
        endereco text,
        cep varchar(10),
        cidade varchar(100),
        estado varchar(2),
        data_conversao date,
        data_batismo date,
        status varchar(20) DEFAULT 'ativo',
        ministerios text[],
        observacoes text,
        foto_url text,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS membros`);
  }
}
