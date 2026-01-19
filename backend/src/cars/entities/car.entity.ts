import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  CNG = 'cng',
  LPG = 'lpg',
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  CVT = 'cvt',
  AMT = 'amt',
}

export enum CarStatus {
  DRAFT = 'draft',
  MEDIA_UPLOADED = 'media_uploaded',
  SUBMITTED = 'submitted',
  ANALYZING = 'analyzing',
  REPORT_READY = 'report_ready',
}

@Entity('cars')
@Index(['userId', 'createdAt'])
@Index(['status'])
export class Car {
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

  @Column({
    type: 'enum',
    enum: FuelType,
    nullable: true,
  })
  fuelType: FuelType;

  @Column({
    type: 'enum',
    enum: TransmissionType,
    nullable: true,
  })
  transmission: TransmissionType;

  @Column('int', { nullable: true })
  kilometersDriven: number;

  @Column('int', { default: 1 })
  ownershipCount: number;

  @Column({ nullable: true })
  vin: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column('jsonb', { nullable: true })
  additionalDetails: any; // For any extra metadata

  @Column({
    type: 'enum',
    enum: CarStatus,
    default: CarStatus.DRAFT,
  })
  status: CarStatus;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
