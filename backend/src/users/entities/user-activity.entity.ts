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

export enum ActivityType {
  REPORT_CREATED = 'report_created',
  REPORT_PURCHASED = 'report_purchased',
  LISTING_CREATED = 'listing_created',
  LISTING_VIEWED = 'listing_viewed',
  CAR_SAVED = 'car_saved',
  CAR_UNSAVED = 'car_unsaved',
  PROFILE_UPDATED = 'profile_updated',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

@Entity('user_activities')
@Index(['userId', 'createdAt'])
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  type: ActivityType;

  @Column({ nullable: true })
  entityType: string; // 'report', 'listing', 'user', etc.

  @Column({ nullable: true })
  entityId: string; // ID of the related entity

  @Column('jsonb', { nullable: true })
  metadata: any; // Additional data about the activity

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
