import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export default class CreateOrders1592498129532 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: false,
          },

          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'fk_orders_customers',
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'orders_products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'numeric(8,2)',
          },
          {
            name: 'quantity',
            type: 'integer',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('orders_products', [
      new TableForeignKey({
        name: 'fk_ordersProduct_orders',
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        name: 'fk_ordersProduct_products',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'orders_products',
      'fk_ordersProduct_products',
    );
    await queryRunner.dropForeignKey(
      'orders_products',
      'fk_ordersProduct_orders',
    );

    await queryRunner.dropTable('orders_product_tb');

    await queryRunner.dropForeignKey('orders', 'fk_orders_customers');

    await queryRunner.dropTable('orders');
  }
}
