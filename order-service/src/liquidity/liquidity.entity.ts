import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'liquidity' })
export class Liquidity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  base_currency: string;

  @Column()
  quote_currency: string;

  @Column('float')
  rate: number;

  @Column('float')
  available_base_amount: number;
}
