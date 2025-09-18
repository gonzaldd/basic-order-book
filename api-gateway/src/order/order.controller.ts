import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ValidationPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './create-order.dto';
import { ProcessOrderDto } from './process-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('orders')
@Controller('order')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    schema: {
      example: {
        id: 'd87adf5d-2f3c-48f4-8b...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  create(@Body() createOrderDto: CreateOrderDto): { id: string } {
    return this.orderService.createOrder(createOrderDto);
  }

  @Post('process-order')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Process order' })
  @ApiBody({ type: ProcessOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Order processed successfully',
    schema: {
      example: { status: 'Order processing initiated' },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  processOrder(@Body() processOrderDto: ProcessOrderDto): { status: string } {
    this.orderService.processOrder(processOrderDto.orderId);
    return { status: 'Order processing initiated' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    schema: {
      example: {
        id: 1,
        monto: 100,
        moneda_origen: 'USD',
        moneda_destino: 'EUR',
        estado: 'pendiente',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Order not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  getOrderById(@Param('id') id: string): Promise<any> {
    return this.orderService.getOrderById(id);
  }
}
