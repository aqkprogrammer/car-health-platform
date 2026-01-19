import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealerController } from './dealer.controller';
import { DealerService } from './dealer.service';
import { Subscription } from './entities/subscription.entity';
import { Car } from '../cars/entities/car.entity';
import { Report } from '../reports/entities/report.entity';
import { Listing } from '../marketplace/entities/listing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Car, Report, Listing]),
  ],
  controllers: [DealerController],
  providers: [DealerService],
  exports: [DealerService],
})
export class DealerModule {}
