import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const { RABBITMQ_URI, RABBITMQ_USER, RABBITMQ_PASS, RABBITMQ_PORT } =
    process.env;
  const rabbitURI = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_URI}:${RABBITMQ_PORT}`;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitURI],
      queue: 'orders',
      consumerTag: 'orders-consumer',
      queueOptions: {
        durable: true,
        arguments: { 'x-queue-type': 'quorum' },
      },
    },
  });

  await app.startAllMicroservices();
  logger.log('Order service is running');
}
bootstrap();
