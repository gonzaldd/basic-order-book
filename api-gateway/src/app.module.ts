import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    AuthModule,
    OrderModule,
  ],
})
export class AppModule {}
