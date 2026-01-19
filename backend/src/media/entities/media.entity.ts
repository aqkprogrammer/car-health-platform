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
import { Car } from '../../cars/entities/car.entity';

export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
}

export enum PhotoType {
  FRONT = 'front',
  REAR = 'rear',
  LEFT = 'left',
  RIGHT = 'right',
  INTERIOR = 'interior',
  ENGINE_BAY = 'engineBay',
}

@Entity('media')
@Index(['carId', 'type'])
@Index(['carId', 'photoType'])
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  carId: string;

  @ManyToOne(() => Car)
  @JoinColumn({ name: 'carId' })
  car: Car;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type: MediaType;

  @Column({
    type: 'enum',
    enum: PhotoType,
    nullable: true,
  })
  photoType: PhotoType; // Only for photos

  @Column()
  fileName: string;

  @Column()
  originalFileName: string;

  @Column()
  mimeType: string;

  @Column('bigint')
  fileSize: number; // Size in bytes

  @Column()
  storageKey: string; // S3 key or storage path

  @Column()
  storageUrl: string; // Public URL or presigned URL

  @Column({ nullable: true })
  thumbnailUrl: string; // For videos or large images

  @Column('int', { nullable: true })
  width: number; // Image/video width in pixels

  @Column('int', { nullable: true })
  height: number; // Image/video height in pixels

  @Column('int', { nullable: true })
  duration: number; // Video duration in seconds

  @Column({ default: false })
  isUploaded: boolean; // Whether file is actually uploaded to storage

  @Column('jsonb', { nullable: true })
  metadata: any; // Additional metadata (EXIF data, etc.)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
