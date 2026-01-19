import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Report } from '../../reports/entities/report.entity';

@Entity('purchased_reports')
@Index(['userId', 'reportId'], { unique: true })
export class PurchasedReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  reportId: string;

  @ManyToOne(() => Report)
  @JoinColumn({ name: 'reportId' })
  report: Report;

  @Column('decimal', { precision: 10, scale: 2 })
  amountPaid: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  paymentId: string;

  @CreateDateColumn()
  purchasedAt: Date;
}
