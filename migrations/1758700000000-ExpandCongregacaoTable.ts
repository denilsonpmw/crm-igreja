import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ExpandCongregacaoTable1758700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnsToAdd = [
      { name: 'website', type: 'varchar', length: '255', isNullable: true },
      { name: 'cnpj', type: 'varchar', length: '20', isNullable: true },
      { name: 'pastor_principal', type: 'varchar', length: '255', isNullable: true },
      { name: 'limite_membros', type: 'integer', default: '100' },
      { name: 'limite_storage_mb', type: 'integer', default: '500' },
      { name: 'limite_mensagens_mes', type: 'integer', default: '1000' },
      { name: 'ativo', type: 'boolean', default: 'true' },
      { name: 'data_fundacao', type: 'date', isNullable: true },
      { name: 'logo_url', type: 'text', isNullable: true },
      { name: 'configuracoes', type: queryRunner.connection.driver.options.type === 'postgres' ? 'jsonb' : 'simple-json', isNullable: true },
    ];
    const table = await queryRunner.getTable('congregacoes');
    for (const col of columnsToAdd) {
      if (!table?.findColumnByName(col.name)) {
        await queryRunner.addColumn('congregacoes', new TableColumn(col));
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('congregacoes', 'website');
    await queryRunner.dropColumn('congregacoes', 'cnpj');
    await queryRunner.dropColumn('congregacoes', 'pastor_principal');
    await queryRunner.dropColumn('congregacoes', 'limite_membros');
    await queryRunner.dropColumn('congregacoes', 'limite_storage_mb');
    await queryRunner.dropColumn('congregacoes', 'limite_mensagens_mes');
    await queryRunner.dropColumn('congregacoes', 'ativo');
    await queryRunner.dropColumn('congregacoes', 'data_fundacao');
    await queryRunner.dropColumn('congregacoes', 'logo_url');
    await queryRunner.dropColumn('congregacoes', 'configuracoes');
  }
}
