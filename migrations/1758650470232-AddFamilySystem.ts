import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFamilySystem1758650470232 implements MigrationInterface {
    name = 'AddFamilySystem1758650470232'

    public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabela 'familias' já criada por migration anterior. Removido para evitar erro de duplicidade.
    await queryRunner.query(`CREATE TABLE "temporary_membros" ("membro_id" uuid PRIMARY KEY NOT NULL, "nome" varchar(255) NOT NULL, "cpf" varchar(14), "data_nascimento" date, "telefone" varchar(20), "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "congregacao_id" uuid, "familia_id" uuid, "sexo" varchar(1), "estado_civil" varchar(20), "profissao" varchar(100), "email" varchar(255), "endereco" text, "cep" varchar(10), "cidade" varchar(100), "estado" varchar(2), "data_conversao" date, "data_batismo" date, "status" varchar(20) NOT NULL DEFAULT ('ativo'), "ministerios" text array, "observacoes" text, "foto_url" text)`);
    await queryRunner.query(`INSERT INTO "temporary_membros"("membro_id", "nome", "cpf", "data_nascimento", "telefone", "created_at", "updated_at", "congregacao_id") SELECT "membro_id", "nome", "cpf", "data_nascimento", "telefone", "created_at", "updated_at", "congregacao_id" FROM "membros"`);
        await queryRunner.query(`DROP TABLE "membros"`);
        await queryRunner.query(`ALTER TABLE "temporary_membros" RENAME TO "membros"`);
    // Tabela temporária 'familias' já não é necessária. Removido para evitar erro de duplicidade.
    // Removido: não existe mais tabela temporária 'temporary_familias'.
        // Criação da tabela temporária 'membros' depende de 'familias', então só remover 'familias' depois.
        await queryRunner.query(`CREATE TABLE "temporary_membros" ("membro_id" uuid PRIMARY KEY NOT NULL, "nome" varchar(255) NOT NULL, "cpf" varchar(14), "data_nascimento" date, "telefone" varchar(20), "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "congregacao_id" uuid, "created_by" uuid, "familia_id" uuid, "sexo" varchar(1), "estado_civil" varchar(20), "profissao" varchar(100), "email" varchar(255), "endereco" text, "cep" varchar(10), "cidade" varchar(100), "estado" varchar(2), "data_conversao" date, "data_batismo" date, "status" varchar(20) NOT NULL DEFAULT ('ativo'), "ministerios" text array, "observacoes" text, "foto_url" text, CONSTRAINT "FK_061c110695b37aaa45e3468b686" FOREIGN KEY ("congregacao_id") REFERENCES "congregacoes" ("congregacao_id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_eda62afd704600968b7695a9f96" FOREIGN KEY ("familia_id") REFERENCES "familias" ("familia_id") ON DELETE SET NULL ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_membros"("membro_id", "nome", "cpf", "data_nascimento", "telefone", "created_at", "updated_at", "congregacao_id", "familia_id", "sexo", "estado_civil", "profissao", "email", "endereco", "cep", "cidade", "estado", "data_conversao", "data_batismo", "status", "ministerios", "observacoes", "foto_url") SELECT "membro_id", "nome", "cpf", "data_nascimento", "telefone", "created_at", "updated_at", "congregacao_id", "familia_id", "sexo", "estado_civil", "profissao", "email", "endereco", "cep", "cidade", "estado", "data_conversao", "data_batismo", "status", "ministerios", "observacoes", "foto_url" FROM "membros"`);
        await queryRunner.query(`DROP TABLE "membros"`);
        await queryRunner.query(`ALTER TABLE "temporary_membros" RENAME TO "membros"`);
        // Agora é seguro remover a tabela 'familias'.
        // Removido: não dropar 'familias' pois é parte do modelo principal e tem dependências de FK.
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "membros" RENAME TO "temporary_membros"`);
    await queryRunner.query(`CREATE TABLE "membros" ("membro_id" uuid PRIMARY KEY NOT NULL, "nome" varchar(255) NOT NULL, "cpf" varchar(14), "data_nascimento" date, "telefone" varchar(20), "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "congregacao_id" uuid, "created_by" uuid, "familia_id" uuid, "sexo" varchar(1), "estado_civil" varchar(20), "profissao" varchar(100), "email" varchar(255), "endereco" text, "cep" varchar(10), "cidade" varchar(100), "estado" varchar(2), "data_conversao" date, "data_batismo" date, "status" varchar(20) NOT NULL DEFAULT ('ativo'), "ministerios" text array, "observacoes" text, "foto_url" text)`);
        await queryRunner.query(`INSERT INTO "membros"("membro_id", "nome", "cpf", "data_nascimento", "telefone", "created_at", "updated_at", "congregacao_id", "created_by", "familia_id", "sexo", "estado_civil", "profissao", "email", "endereco", "cep", "cidade", "estado", "data_conversao", "data_batismo", "status", "ministerios", "observacoes", "foto_url") SELECT "membro_id", "nome", "cpf", "data_nascimento", "telefone", "created_at", "updated_at", "congregacao_id", "created_by", "familia_id", "sexo", "estado_civil", "profissao", "email", "endereco", "cep", "cidade", "estado", "data_conversao", "data_batismo", "status", "ministerios", "observacoes", "foto_url" FROM "temporary_membros"`);
        await queryRunner.query(`DROP TABLE "temporary_membros"`);
        await queryRunner.query(`ALTER TABLE "familias" RENAME TO "temporary_familias"`);
    // Tabela 'familias' já criada por migration anterior. Removido para evitar erro de duplicidade.
        await queryRunner.query(`INSERT INTO "familias"("familia_id", "congregacao_id", "nome_familia", "endereco", "cep", "cidade", "estado", "telefone_principal", "responsavel_id", "observacoes", "ativo", "created_at", "updated_at") SELECT "familia_id", "congregacao_id", "nome_familia", "endereco", "cep", "cidade", "estado", "telefone_principal", "responsavel_id", "observacoes", "ativo", "created_at", "updated_at" FROM "temporary_familias"`);
        await queryRunner.query(`DROP TABLE "temporary_familias"`);
        await queryRunner.query(`ALTER TABLE "membros" RENAME TO "temporary_membros"`);
        await queryRunner.query(`CREATE TABLE "membros" ("membro_id" uuid PRIMARY KEY NOT NULL, "nome" varchar(255) NOT NULL, "cpf" varchar(14), "data_nascimento" date, "telefone" varchar(20), "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "congregacao_id" uuid, "created_by" uuid)`);
        await queryRunner.query(`INSERT INTO "membros"("membro_id", "nome", "cpf", "data_nascimento", "telefone", "created_at", "updated_at", "congregacao_id", "created_by") SELECT "membro_id", "nome", "cpf", "data_nascimento", "telefone", "created_at", "updated_at", "congregacao_id", "created_by" FROM "temporary_membros"`);
        await queryRunner.query(`DROP TABLE "temporary_membros"`);
        await queryRunner.query(`DROP TABLE "familias"`);
    }

}
