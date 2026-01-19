import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { Car } from '../cars/entities/car.entity';
import { Report } from '../reports/entities/report.entity';
import { Listing } from '../marketplace/entities/listing.entity';

@Injectable()
export class DealerService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
  ) {}

  async getDashboard(userId: string) {
    // Get all cars for the dealer
    const allCars = await this.carsRepository.find({
      where: { userId, deletedAt: null },
    });

    // Get active listings (listings that are active)
    const activeListings = await this.listingsRepository.find({
      where: { userId, isActive: true },
      relations: ['report'],
    });

    // Get pending reports (reports with status 'pending')
    const pendingReports = await this.reportsRepository.find({
      where: { userId, status: 'pending' },
    });

    // Calculate average trust score from reports
    const reportsWithScores = await this.reportsRepository.find({
      where: { userId },
      select: ['trustScore'],
    });
    const scores = reportsWithScores
      .map((r) => r.trustScore)
      .filter((score) => score !== null && score !== undefined);
    const averageTrustScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + Number(score), 0) / scores.length
        : 0;

    // Calculate total value from active listings
    const totalValue = activeListings.reduce(
      (sum, listing) => sum + Number(listing.price || 0),
      0,
    );

    return {
      totalCars: allCars.length,
      activeListings: activeListings.length,
      pendingReports: pendingReports.length,
      averageTrustScore: Math.round(averageTrustScore * 10) / 10, // Round to 1 decimal
      totalValue: totalValue,
      currency: activeListings.length > 0 ? activeListings[0].currency || 'INR' : 'INR',
    };
  }

  async getSubscription(userId: string) {
    // Get or create default subscription
    let subscription = await this.subscriptionRepository.findOne({
      where: { userId },
    });

    // If no subscription exists, create a default free plan
    if (!subscription) {
      subscription = this.subscriptionRepository.create({
        userId,
        planName: 'Free Plan',
        maxReports: 5,
        maxListings: 10,
        price: 0,
        currency: 'INR',
        period: 'monthly',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
      subscription = await this.subscriptionRepository.save(subscription);
    }

    // Count reports used
    const reportsCount = await this.reportsRepository.count({
      where: { userId },
    });

    // Count listings used
    const listingsCount = await this.listingsRepository.count({
      where: { userId },
    });

    // Calculate remaining
    const reportsRemaining = Math.max(0, subscription.maxReports - reportsCount);
    const listingsRemaining = Math.max(0, subscription.maxListings - listingsCount);

    return {
      plan: {
        id: subscription.id,
        name: subscription.planName,
        maxReports: subscription.maxReports,
        maxListings: subscription.maxListings,
        price: Number(subscription.price),
        currency: subscription.currency,
        period: subscription.period,
      },
      reportsUsed: reportsCount,
      reportsRemaining: reportsRemaining,
      listingsUsed: listingsCount,
      listingsRemaining: listingsRemaining,
      renewalDate: subscription.renewalDate
        ? subscription.renewalDate.toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }
}
