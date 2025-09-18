import { IsNumber, IsString, IsPositive, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Monto de la orden',
    example: 100,
    minimum: 0.01
  })
  @IsNumber()
  @IsPositive()
  monto: number;

  @ApiProperty({
    description: 'Código de moneda de origen',
    example: 'USD',
    minLength: 3,
    maxLength: 3
  })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  moneda_origen: string;

  @ApiProperty({
    description: 'Código de moneda de destino',
    example: 'EUR',
    minLength: 3,
    maxLength: 3
  })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  moneda_destino: string;
}
