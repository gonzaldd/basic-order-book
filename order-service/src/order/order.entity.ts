import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum OrderState {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float')
  monto: number;

  @Column()
  moneda_origen: string;

  @Column()
  moneda_destino: string;

  @Column({ type: 'enum', enum: OrderState, default: OrderState.PENDING })
  estado: OrderState;

  @Column('float', { nullable: true })
  executed_rate?: number;

  @Column('float', { nullable: true })
  executed_amount?: number;

  @Column({ default: 0 })
  attempts: number;

  @Column({ nullable: true })
  failure_reason?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
