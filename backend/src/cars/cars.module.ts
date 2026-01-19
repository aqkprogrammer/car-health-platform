import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { Car } from './entities/car.entity';
import { UsersModule } from '../users/users.module';
import { MediaModule } from '../media/media.module';
import { AIJobsModule } from '../ai-jobs/ai-jobs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Car]),
    forwardRef(() => UsersModule),
    forwardRef(() => MediaModule),
    forwardRef(() => AIJobsModule),
  ],
  controllers: [CarsController],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
