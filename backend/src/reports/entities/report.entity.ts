import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column('jsonb', { nullable: true })
  carDetails: any;

  @Column('jsonb', { nullable: true })
  media: any;

  @Column('jsonb', { nullable: true })
  aiAnalysis: any;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  trustScore: number;

  @Column({ nullable: true })
  verdict: string;

  @Column({ nullable: true })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
