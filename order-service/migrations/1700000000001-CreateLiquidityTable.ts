import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

export class CreateLiquidityTable1700000000001 implements MigrationInterface {
  name = 'CreateLiquidityTable1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'liquidity',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'base_currency',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'quote_currency',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'rate',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'available_base_amount',
            type: 'float',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Insert example data
    await queryRunner.query(`
      INSERT INTO liquidity (base_currency, quote_currency, rate, available_base_amount) VALUES
      ('USD', 'EUR', 0.85, 10000.00),
      ('EUR', 'USD', 1.18, 8500.00),
      ('USD', 'BTC', 0.000023, 5000.00),
      ('BTC', 'USD', 43500.00, 0.5),
      ('ETH', 'USD', 2650.00, 10.0),
      ('USD', 'ETH', 0.00038, 25000.00)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('liquidity');
  }
}
