import { type MigrationInterface, type QueryRunner, Table } from 'typeorm';

export class CreateOrderTable1700000000000 implements MigrationInterface {
  name = 'CreateOrderTable1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'monto',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'moneda_origen',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'moneda_destino',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'estado',
            type: 'enum',
            enum: ['PENDING', 'PROCESSED', 'FAILED'],
            isNullable: false,
            default: "'PENDING'",
          },
          {
            name: 'executed_rate',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'executed_amount',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'attempts',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'failure_reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
  }
}
