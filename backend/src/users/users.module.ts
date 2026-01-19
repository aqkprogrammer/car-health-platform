import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { SavedCar } from './entities/saved-car.entity';
import { UserActivity } from './entities/user-activity.entity';
import { PurchasedReport } from './entities/purchased-report.entity';
import { Report } from '../reports/entities/report.entity';
import { Listing } from '../marketplace/entities/listing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      SavedCar,
      UserActivity,
      PurchasedReport,
      Report,
      Listing,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
