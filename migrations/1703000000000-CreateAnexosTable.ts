import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAnexosTable1703000000000 implements MigrationInterface {
    name = 'CreateAnexosTable1703000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Garantir que a extensão uuid-ossp está habilitada
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "anexos" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "congregacao_id" uuid,
                "entity_type" varchar(50) NOT NULL,
                "entity_id" uuid NOT NULL,
                "file_name" varchar(255) NOT NULL,
                "file_path" text NOT NULL,
                "file_size" bigint NOT NULL,
                "mime_type" varchar(100) NOT NULL,
                "checksum" varchar(64),
                "uploaded_by" uuid,
                "virus_scan_status" varchar(20) DEFAULT 'pending',
                "virus_scan_result" varchar(100),
                "created_at" timestamp NOT NULL DEFAULT now()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "anexos"`);
    }

}
