import { Module } from '@nestjs/common';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './order/order.entity';
import { Liquidity } from './liquidity/liquidity.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT
        ? Number(process.env.DATABASE_PORT)
        : 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DB,
      entities: [Order, Liquidity],
      migrations: [__dirname + '/migrations/*.ts'],
      migrationsRun: false,
      // synchronize: true,
    }),
    TypeOrmModule.forFeature([Order, Liquidity]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule {}
