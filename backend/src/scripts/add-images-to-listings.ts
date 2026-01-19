import { DataSource } from 'typeorm';
import { Listing } from '../marketplace/entities/listing.entity';
import { Report } from '../reports/entities/report.entity';

async function addImagesToListings() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'car_health_platform',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const listingRepository = dataSource.getRepository(Listing);
    const reportRepository = dataSource.getRepository(Report);

    // Listing IDs to update
    const listingIds = [
      'c134b676-8f82-4b1e-ab5d-ad98964a1968',
      '407cda12-6844-4163-b6be-ba8d80b3e4a9',
    ];

    // Car images to use (8 images per car)
    const carImages = [
      'https://images.unsplash.com/photo-1492144534655-ae79c2c034d7?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1549317661-bd32c8b0c2a3?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1606664515524-9f283c033ba2?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop&auto=format',
    ];

    for (const listingId of listingIds) {
      console.log(`\n🔍 Processing listing: ${listingId}`);
      
      // Find the listing
      const listing = await listingRepository.findOne({
        where: { id: listingId },
        relations: ['report'],
      });

      if (!listing) {
        console.log(`❌ Listing ${listingId} not found`);
        continue;
      }

      console.log(`✅ Found listing: ${listing.id}`);
      console.log(`   Price: ${listing.price} ${listing.currency}`);
      console.log(`   Location: ${listing.city}, ${listing.state}`);

      if (!listing.reportId) {
        console.log(`❌ Listing ${listingId} has no reportId`);
        continue;
      }

      // Find the report
      const report = await reportRepository.findOne({
        where: { id: listing.reportId },
      });

      if (!report) {
        console.log(`❌ Report ${listing.reportId} not found`);
        continue;
      }

      console.log(`✅ Found report: ${report.id}`);
      console.log(`   Car: ${report.make} ${report.model} ${report.year}`);

      // Update the report's media field
      const updatedMedia = {
        images: carImages,
        videos: [],
      };

      report.media = updatedMedia;
      await reportRepository.save(report);

      console.log(`✅ Updated report ${report.id} with ${carImages.length} images`);
      console.log(`   Images added:`, carImages.slice(0, 3).map(url => url.split('/').pop()?.split('?')[0]).join(', '), '...');
    }

    console.log('\n🎉 Successfully updated listings with images!');
  } catch (error) {
    console.error('❌ Error updating listings:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

addImagesToListings();
