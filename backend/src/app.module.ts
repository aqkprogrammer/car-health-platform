import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { ChatModule } from './chat/chat.module';
import { DealerModule } from './dealer/dealer.module';
import { PaymentsModule } from './payments/payments.module';
import { CarsModule } from './cars/cars.module';
import { MediaModule } from './media/media.module';
import { AIJobsModule } from './ai-jobs/ai-jobs.module';
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [DatabaseConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
        // Enable soft delete
        extra: {
          max: 10,
        },
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    CarsModule,
    MediaModule,
    ReportsModule,
    MarketplaceModule,
    ChatModule,
    DealerModule,
    PaymentsModule,
    AIJobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
