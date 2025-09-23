import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateFamilyTable1701500001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela familias
    await queryRunner.createTable(
      new Table({
        name: 'familias',
        columns: [
          {
            name: 'familia_id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'congregacao_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'nome_familia',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'endereco',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'bairro',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'cidade',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'estado',
            type: 'varchar',
            length: '2',
            isNullable: true,
          },
          {
            name: 'cep',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'telefone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'observacoes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ativo',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Adicionar foreign key para congregacao_id na tabela familias
    await queryRunner.createForeignKey(
      'familias',
      new TableForeignKey({
        columnNames: ['congregacao_id'],
        referencedTableName: 'congregacoes',
        referencedColumnNames: ['congregacao_id'],
        onDelete: 'CASCADE',
      })
    );

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign key familia_id da tabela membros
    const membrosTable = await queryRunner.getTable('membros');
    const familiaForeignKey = membrosTable?.foreignKeys.find(
      fk => fk.columnNames.indexOf('familia_id') !== -1
    );
    if (familiaForeignKey) {
      await queryRunner.dropForeignKey('membros', familiaForeignKey);
    }

    // Remover colunas adicionadas na tabela membros
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS familia_id');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS sexo');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS estado_civil');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS profissao');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS email');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS endereco');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS cep');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS cidade');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS estado');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS data_conversao');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS data_batismo');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS status');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS ministerios');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS observacoes');
    await queryRunner.query('ALTER TABLE membros DROP COLUMN IF EXISTS foto_url');

    // Remover tabela familias
    await queryRunner.dropTable('familias');
  }
}