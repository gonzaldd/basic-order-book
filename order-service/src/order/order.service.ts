import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { Order, OrderState } from './order.entity';
import { CreateOrderDto } from './create-order.dto';
import { Liquidity } from '../liquidity/liquidity.entity';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private MAX_ATTEMPTS = 3;

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Liquidity)
    private readonly liquidityRepo: Repository<Liquidity>,
    private readonly connection: Connection,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      if (createOrderDto.moneda_origen === createOrderDto.moneda_destino) {
        throw new BadRequestException(
          'Origin and destination currencies must be different',
        );
      }

      const order = this.orderRepo.create({
        ...createOrderDto,
        estado: OrderState.PENDING,
      });

      const savedOrder = await this.orderRepo.save(order);
      this.logger.log('Order created successfully:', savedOrder);

      return savedOrder;
    } catch (error) {
      this.logger.error('Error creating order:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async processOrder(orderId: string): Promise<Order> {
    try {
      return await this.connection.transaction(async (manager) => {
        const order = await manager.findOne(Order, {
          where: { id: orderId },
          lock: {
            mode: 'pessimistic_write',
            onLocked: 'skip_locked',
          },
        });

        if (!order) {
          throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        if (order.estado === OrderState.PROCESSED) {
          this.logger.log(`Order ${orderId} already processed`);
          return order;
        }

        if (order.attempts >= this.MAX_ATTEMPTS) {
          order.estado = OrderState.FAILED;
          order.failure_reason = 'max attempts exceeded';
          await manager.save(order);
          this.logger.warn(`Order ${orderId} failed: max attempts exceeded`);
          return order;
        }

        const liquidity = await this.findLiquidity(
          manager,
          order.moneda_origen,
          order.moneda_destino,
        );
        if (!liquidity) {
          return await this.handleLiquidityError(
            manager,
            order,
            'no liquidity',
          );
        }

        if (liquidity.available_base_amount < order.monto) {
          return await this.handleLiquidityError(
            manager,
            order,
            'insufficient liquidity',
          );
        }

        return await this.executeOrder(manager, order, liquidity);
      });
    } catch (error) {
      this.logger.error(`Error processing order ${orderId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process order');
    }
  }

  private async findLiquidity(
    manager: any,
    baseCurrency: string,
    quoteCurrency: string,
  ): Promise<Liquidity | null> {
    return await manager.findOne(Liquidity, {
      where: {
        base_currency: baseCurrency,
        quote_currency: quoteCurrency,
      },
    });
  }

  private async handleLiquidityError(
    manager: any,
    order: Order,
    reason: string,
  ): Promise<Order> {
    order.attempts += 1;
    order.failure_reason = reason;

    if (order.attempts >= this.MAX_ATTEMPTS) {
      order.estado = OrderState.FAILED;
    }

    await manager.save(order);
    this.logger.warn(
      `Order ${order.id} liquidity error: ${reason}, attempt ${order.attempts}`,
    );
    throw new BadRequestException(reason);
  }

  private async executeOrder(
    manager: any,
    order: Order,
    liquidity: Liquidity,
  ): Promise<Order> {
    const executedRate = liquidity.rate;
    const destAmount = Number((order.monto * executedRate).toFixed(8));

    // Update liquidity
    liquidity.available_base_amount = Number(
      (liquidity.available_base_amount - order.monto).toFixed(8),
    );

    // Update order
    order.executed_rate = executedRate;
    order.executed_amount = destAmount;
    order.estado = OrderState.PROCESSED;
    order.failure_reason = undefined;

    await manager.save(liquidity);
    await manager.save(order);

    this.logger.log(
      `Order ${order.id} executed successfully at rate ${executedRate}`,
    );
    return order;
  }
}
