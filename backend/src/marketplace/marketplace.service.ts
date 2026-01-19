import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UsersService } from '../users/users.service';
import { ActivityType } from '../users/entities/user-activity.entity';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async create(createListingDto: CreateListingDto, userId: string): Promise<Listing> {
    const listing = this.listingsRepository.create({
      ...createListingDto,
      userId,
    });
    const savedListing = await this.listingsRepository.save(listing);

    // Track activity
    await this.usersService.trackActivity(
      userId,
      ActivityType.LISTING_CREATED,
      'listing',
      savedListing.id,
      {
        price: savedListing.price,
        currency: savedListing.currency,
        reportId: savedListing.reportId,
      },
      `Created marketplace listing`,
    );

    return savedListing;
  }

  async findAll(filters: any): Promise<any[]> {
    const queryBuilder = this.listingsRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.report', 'report')
      .leftJoinAndSelect('listing.user', 'user')
      .where('listing.isActive = :isActive', { isActive: true });
    
    if (filters.city) {
      queryBuilder.andWhere('listing.city = :city', { city: filters.city });
    }
    
    if (filters.state) {
      queryBuilder.andWhere('listing.state = :state', { state: filters.state });
    }
    
    if (filters.minPrice) {
      queryBuilder.andWhere('listing.price >= :minPrice', { minPrice: filters.minPrice });
    }
    
    if (filters.maxPrice) {
      queryBuilder.andWhere('listing.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.budgetMin) {
      queryBuilder.andWhere('listing.price >= :budgetMin', { budgetMin: filters.budgetMin });
    }
    
    if (filters.budgetMax) {
      queryBuilder.andWhere('listing.price <= :budgetMax', { budgetMax: filters.budgetMax });
    }

    if (filters.make) {
      queryBuilder.andWhere('report.make = :make', { make: filters.make });
    }

    if (filters.model) {
      queryBuilder.andWhere('report.model = :model', { model: filters.model });
    }

    const listings = await queryBuilder.getMany();
    console.log(`Found ${listings.length} active listings`);
    
    // Transform listings to include images and properly serialize
    return listings.map(listing => this.transformListing(listing));
  }

  /**
   * Extract images from report media or use placeholder images
   */
  private extractImages(listing: Listing): string[] {
    // Try to get images from report.media
    if (listing.report?.media) {
      let media = listing.report.media;
      
      // Handle JSONB field - might be a string that needs parsing
      if (typeof media === 'string') {
        try {
          media = JSON.parse(media);
        } catch (e) {
          console.warn('Failed to parse report.media as JSON:', e);
        }
      }
      
      if (Array.isArray(media)) {
        const urls = media
          .filter((m: any) => m.storageUrl || m.url)
          .map((m: any) => m.storageUrl || m.url);
        if (urls.length > 0) {
          console.log(`Extracted ${urls.length} images from media array for listing ${listing.id}`);
          return urls;
        }
      } else if (typeof media === 'object' && media !== null) {
        // Check for media.images array
        if (media.images && Array.isArray(media.images)) {
          // Filter out any non-string values and return
          const imageUrls = media.images.filter((img: any) => typeof img === 'string');
          if (imageUrls.length > 0) {
            console.log(`Extracted ${imageUrls.length} images from media.images for listing ${listing.id}`);
            return imageUrls;
          }
        }
      }
    }

    // Fallback: Generate placeholder images based on car make/model
    const placeholderImages = this.generatePlaceholderImages(listing.report);
    console.log(`Using ${placeholderImages.length} placeholder images for listing ${listing.id} (${listing.report?.make || 'unknown'} ${listing.report?.model || 'unknown'})`);
    return placeholderImages;
  }

  /**
   * Generate placeholder images using Unsplash or similar service
   */
  private generatePlaceholderImages(report: any): string[] {
    if (!report) {
      return [];
    }

    const make = (report.make || 'car').toLowerCase().replace(/\s+/g, '-');
    const model = (report.model || 'vehicle').toLowerCase().replace(/\s+/g, '-');
    
    // Use Unsplash Source API for placeholder car images
    // These are free placeholder images that don't require API keys
    const baseUrl = 'https://images.unsplash.com';
    const imageIds = [
      'photo-1492144534655-ae79c2c034d7', // Car front
      'photo-1503376780353-7e6692767b70', // Car side
      'photo-1494976388531-d1058494cdd8', // Car interior
      'photo-1502877338535-766e1452684a', // Car detail
      'photo-1549317661-bd32c8b0c2a3', // Car angle
      'photo-1552519507-da3b142c6e3d', // Car profile
      'photo-1606664515524-9f283c033ba2', // Car rear
      'photo-1605559424843-9e4c228bf1c2', // Car close-up
    ];

    return imageIds.map(id => `${baseUrl}/${id}?w=800&h=600&fit=crop`);
  }

  async findOne(id: string): Promise<any> {
    const listing = await this.listingsRepository.findOne({ 
      where: { id },
      relations: ['report', 'user'],
    });
    
    if (!listing) {
      return null;
    }

    return this.transformListing(listing, true); // true = include full details
  }

  /**
   * Transform listing to include comprehensive data
   */
  private transformListing(listing: Listing, includeFullDetails: boolean = false): any {
    const images = this.extractImages(listing);
    const carDetails = this.extractCarDetails(listing.report);
    const media = this.extractStructuredMedia(listing.report);
    const aiAnalysis = this.extractAIAnalysis(listing.report);
    const priceInfo = this.extractPriceInfo(listing);
    const location = this.extractLocation(listing);
    const sellerInfo = this.extractSellerInfo(listing.user);
    const carSpecs = this.extractCarSpecs(listing.report, carDetails);
    const listingMetrics = this.extractListingMetrics(listing);
    const verificationBadges = this.extractVerificationBadges(listing, carDetails);
    const marketData = this.extractMarketData(listing, carSpecs);
    
    const baseListing = {
      id: listing.id,
      userId: listing.userId,
      reportId: listing.reportId,
      price: Number(listing.price),
      currency: listing.currency,
      priceInfo,
      city: listing.city,
      state: listing.state,
      location,
      isActive: listing.isActive,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      listedAt: listing.createdAt,
      // Car information
      make: listing.report?.make || null,
      model: listing.report?.model || null,
      year: listing.report?.year || null,
      carSpecs,
      carDetails,
      // Media
      images,
      media,
      // Report information
      report: listing.report ? {
        id: listing.report.id,
        userId: listing.report.userId,
        make: listing.report.make,
        model: listing.report.model,
        year: listing.report.year,
        carDetails: listing.report.carDetails,
        media: listing.report.media,
        aiAnalysis: listing.report.aiAnalysis,
        trustScore: listing.report.trustScore ? Number(listing.report.trustScore) : null,
        verdict: listing.report.verdict,
        status: listing.report.status,
        createdAt: listing.report.createdAt,
        updatedAt: listing.report.updatedAt,
        // AI Analysis insights
        aiInsights: aiAnalysis,
      } : null,
      // Seller information
      seller: sellerInfo,
      user: listing.user ? {
        id: listing.user.id,
        email: listing.user.email,
        firstName: listing.user.firstName,
        lastName: listing.user.lastName,
        phone: listing.user.phone,
        city: listing.user.city,
        state: listing.user.state,
      } : null,
      // Listing metrics
      metrics: listingMetrics,
      // Verification badges
      verification: verificationBadges,
      // Market data
      marketData,
    };

    // Add full details if requested
    if (includeFullDetails) {
      return {
        ...baseListing,
        // Additional detailed information
        reportStatus: listing.report?.status || null,
        reportCreatedAt: listing.report?.createdAt || null,
        reportUpdatedAt: listing.report?.updatedAt || null,
        // Additional car details from report
        additionalCarDetails: listing.report?.carDetails || null,
        // Full AI analysis
        fullAIAnalysis: listing.report?.aiAnalysis || null,
      };
    }

    return baseListing;
  }

  /**
   * Extract listing metrics
   */
  private extractListingMetrics(listing: Listing): any {
    const now = new Date();
    const createdAt = listing.createdAt;
    const updatedAt = listing.updatedAt;
    
    const listingAgeDays = createdAt 
      ? Math.floor((now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    const lastUpdatedDays = updatedAt && updatedAt !== createdAt
      ? Math.floor((now.getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      listingAgeDays,
      lastUpdatedDays,
      isNew: listingAgeDays !== null && listingAgeDays <= 7, // New if listed within 7 days
      isRecentlyUpdated: lastUpdatedDays !== null && lastUpdatedDays <= 3, // Updated within 3 days
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  }

  /**
   * Extract verification badges
   */
  private extractVerificationBadges(listing: Listing, carDetails: any): any {
    const badges = {
      reportVerified: !!listing.report?.id,
      vinVerified: !!(carDetails?.vin),
      registrationVerified: !!(carDetails?.registrationNumber),
      sellerVerified: !!(listing.user?.isActive),
      mediaVerified: false,
      locationVerified: !!(listing.city && listing.state),
    };

    // Check if media exists
    if (listing.report?.media) {
      let media = listing.report.media;
      if (typeof media === 'string') {
        try {
          media = JSON.parse(media);
        } catch (e) {
          // Ignore parse errors
        }
      }
      badges.mediaVerified = Array.isArray(media) && media.length > 0;
    }

    // Calculate verification score
    const verificationScore = Object.values(badges).filter(Boolean).length;
    const maxScore = Object.keys(badges).length;
    const verificationPercentage = Math.round((verificationScore / maxScore) * 100);

    return {
      ...badges,
      verificationScore,
      maxScore,
      verificationPercentage,
      isFullyVerified: verificationScore === maxScore,
    };
  }

  /**
   * Extract market data and comparisons
   */
  private extractMarketData(listing: Listing, carSpecs: any): any {
    if (!carSpecs || !listing.price) {
      return null;
    }

    const price = Number(listing.price);
    const kilometersDriven = carSpecs.kilometersDriven;
    const year = carSpecs.year;
    
    // Calculate price per kilometer
    const pricePerKm = kilometersDriven && kilometersDriven > 0
      ? Math.round(price / kilometersDriven)
      : null;

    // Calculate depreciation estimate (rough estimate: ~10-15% per year)
    const carAge = carSpecs.carAge;
    const estimatedOriginalPrice = carAge && carAge > 0
      ? Math.round(price / Math.pow(0.9, carAge)) // Assuming 10% depreciation per year
      : null;

    // Calculate value retention
    const valueRetention = estimatedOriginalPrice && estimatedOriginalPrice > 0
      ? Math.round((price / estimatedOriginalPrice) * 100)
      : null;

    return {
      pricePerKm,
      estimatedOriginalPrice,
      valueRetention,
      // Market indicators
      isGoodValue: pricePerKm !== null && pricePerKm < 50, // Less than 50 per km is good value
      isLowMileage: kilometersDriven !== null && carAge !== null && carAge > 0 
        ? (kilometersDriven / carAge) < 15000 // Less than 15k km per year
        : null,
      isWellMaintained: carSpecs.avgKmPerYear !== null && carSpecs.avgKmPerYear < 15000,
    };
  }

  /**
   * Extract structured car details from report
   */
  private extractCarDetails(report: any): any {
    if (!report?.carDetails) {
      return null;
    }

    let carDetails = report.carDetails;
    if (typeof carDetails === 'string') {
      try {
        carDetails = JSON.parse(carDetails);
      } catch (e) {
        return null;
      }
    }

    return {
      fuelType: carDetails.fuelType || null,
      transmission: carDetails.transmission || null,
      kilometersDriven: carDetails.kilometersDriven || null,
      ownershipCount: carDetails.ownershipCount || null,
      color: carDetails.color || null,
      vin: carDetails.vin || null,
      registrationNumber: carDetails.registrationNumber || null,
      city: carDetails.city || null,
      state: carDetails.state || null,
      country: carDetails.country || null,
      ...carDetails, // Include any additional fields
    };
  }

  /**
   * Extract structured media (photos and videos separately)
   */
  private extractStructuredMedia(report: any): any {
    if (!report?.media) {
      return { photos: [], videos: [] };
    }

    let media = report.media;
    if (typeof media === 'string') {
      try {
        media = JSON.parse(media);
      } catch (e) {
        return { photos: [], videos: [] };
      }
    }

    if (!Array.isArray(media)) {
      return { photos: [], videos: [] };
    }

    const photos = media
      .filter((m: any) => m.type === 'photo' || !m.type)
      .map((m: any) => ({
        id: m.id,
        type: m.type || 'photo',
        photoType: m.photoType || null,
        url: m.storageUrl || m.url || null,
        thumbnailUrl: m.thumbnailUrl || m.storageUrl || m.url || null,
        fileName: m.fileName || null,
      }));

    const videos = media
      .filter((m: any) => m.type === 'video')
      .map((m: any) => ({
        id: m.id,
        type: 'video',
        url: m.storageUrl || m.url || null,
        thumbnailUrl: m.thumbnailUrl || null,
        fileName: m.fileName || null,
        duration: m.duration || null,
      }));

    return { photos, videos };
  }

  /**
   * Extract AI analysis insights
   */
  private extractAIAnalysis(report: any): any {
    if (!report?.aiAnalysis) {
      return null;
    }

    let aiAnalysis = report.aiAnalysis;
    if (typeof aiAnalysis === 'string') {
      try {
        aiAnalysis = JSON.parse(aiAnalysis);
      } catch (e) {
        return null;
      }
    }

    return {
      status: aiAnalysis.status || null,
      jobCreatedAt: aiAnalysis.jobCreatedAt || null,
      highlights: aiAnalysis.highlights || [],
      issues: aiAnalysis.issues || [],
      recommendations: aiAnalysis.recommendations || [],
      summary: aiAnalysis.summary || null,
      ...aiAnalysis, // Include any additional fields
    };
  }

  /**
   * Extract price information
   */
  private extractPriceInfo(listing: Listing): any {
    const price = Number(listing.price);
    const currency = listing.currency || 'INR';
    
    // Format price based on currency
    const formattedPrice = currency === 'INR' 
      ? `₹${price.toLocaleString('en-IN')}`
      : `${currency} ${price.toLocaleString()}`;

    // Calculate price per km if kilometersDriven is available
    let pricePerKm = null;
    if (listing.report?.carDetails) {
      const carDetails = typeof listing.report.carDetails === 'string' 
        ? JSON.parse(listing.report.carDetails) 
        : listing.report.carDetails;
      const kmDriven = carDetails?.kilometersDriven;
      if (kmDriven && kmDriven > 0) {
        pricePerKm = Math.round(price / kmDriven);
      }
    }

    return {
      amount: price,
      currency,
      formatted: formattedPrice,
      pricePerKm,
    };
  }

  /**
   * Extract location information
   */
  private extractLocation(listing: Listing): any {
    return {
      city: listing.city || null,
      state: listing.state || null,
      fullAddress: listing.city && listing.state 
        ? `${listing.city}, ${listing.state}` 
        : listing.city || listing.state || null,
    };
  }

  /**
   * Extract seller information
   */
  private extractSellerInfo(user: any): any {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.email || 'Unknown',
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      email: user.email || null,
      phone: user.phone || null,
      location: {
        city: user.city || null,
        state: user.state || null,
      },
      verified: user.verified || false, // Assuming there's a verified field
    };
  }

  /**
   * Extract car specifications
   */
  private extractCarSpecs(report: any, carDetails: any): any {
    if (!report) {
      return null;
    }

    const year = report.year;
    const currentYear = new Date().getFullYear();
    const carAge = year ? currentYear - year : null;
    const kilometersDriven = carDetails?.kilometersDriven || null;
    const avgKmPerYear = carAge && kilometersDriven && carAge > 0 
      ? Math.round(kilometersDriven / carAge) 
      : null;

    return {
      make: report.make || null,
      model: report.model || null,
      year: year || null,
      fuelType: carDetails?.fuelType || null,
      transmission: carDetails?.transmission || null,
      kilometersDriven: kilometersDriven,
      ownershipCount: carDetails?.ownershipCount || null,
      color: carDetails?.color || null,
      vin: carDetails?.vin || null,
      registrationNumber: carDetails?.registrationNumber || null,
      fullName: report.make && report.model && year
        ? `${year} ${report.make} ${report.model}`
        : null,
      carAge,
      avgKmPerYear,
      // Additional details
      city: carDetails?.city || null,
      state: carDetails?.state || null,
      country: carDetails?.country || null,
    };
  }
}
