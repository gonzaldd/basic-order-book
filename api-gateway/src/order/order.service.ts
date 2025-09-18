import {
  Inject,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { CreateOrderDto } from './create-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly REQUEST_TIMEOUT = 10000;

  constructor(@Inject('ORDER_SERVICE') private readonly client: ClientProxy) {}

  createOrder(orderData: CreateOrderDto): { id: string } {
    try {
      const id = uuidv4();
      this.logger.log('Creating order:', orderData);
      this.client.emit('create-order', { id, ...orderData });
      return { id };
    } catch (error) {
      this.logger.error('Error creating order:', error);
      if (error.name === 'TimeoutError') {
        throw new InternalServerErrorException('Order service timeout');
      }
      throw error;
    }
  }

  async getOrderById(id: string): Promise<any> {
    try {
      this.logger.log('Retrieving order:', id);

      const resultadoObservable = this.client
        .send({ cmd: 'get-order' }, { id })
        .pipe(timeout(this.REQUEST_TIMEOUT));

      const result = await firstValueFrom(resultadoObservable);
      this.logger.log('Order retrieved successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error retrieving order:', error);
      if (error.name === 'TimeoutError') {
        throw new InternalServerErrorException('Order service timeout');
      }
      throw error;
    }
  }

  processOrder(orderId: string) {
    try {
      this.logger.log('Processing order:', orderId);
      this.client.emit('process-order', { orderId });
      this.logger.log('Order processing request sent:', orderId);
    } catch (error) {
      this.logger.error('Error sending process order request:', error);
      throw new InternalServerErrorException(
        'Failed to send process order request',
      );
    }
  }
}
