import { IsNumber, IsString, IsPositive, MinLength, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  monto: number;

  @IsString()
  @MinLength(3)
  @MaxLength(3)
  moneda_origen: string;

  @IsString()
  @MinLength(3)
  @MaxLength(3)
  moneda_destino: string;
}
