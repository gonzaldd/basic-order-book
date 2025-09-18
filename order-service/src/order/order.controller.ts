import { Controller, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { CreateOrderDto } from './create-order.dto';

@Controller()
export class OrderController {
  private logger = new Logger(OrderController.name);
  constructor(private readonly orderService: OrderService) {}

  @EventPattern('create-order')
  async createOrder(data: CreateOrderDto) {
    this.logger.log('Creating order with data:', data);
    return await this.orderService.createOrder(data);
  }

  @MessagePattern({ cmd: 'get-order' })
  async getOrder(data: { id: string }) {
    this.logger.log('Getting order with ID:', data.id);
    return await this.orderService.getOrderById(data.id);
  }

  @EventPattern('process-order')
  async processOrder(data: { orderId: string }) {
    this.logger.log('Processing order with ID:', data.orderId);
    try {
      await this.orderService.processOrder(data.orderId);
      return { status: 'Order processing initiated' };
    } catch (error) {
      this.logger.error('Error processing order:', error);
      throw error;
    }
  }
}
