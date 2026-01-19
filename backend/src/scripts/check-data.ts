import { DataSource } from 'typeorm';
import { Listing } from '../marketplace/entities/listing.entity';
import { Report } from '../reports/entities/report.entity';
import { User } from '../users/entities/user.entity';

async function checkData() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'car_health_platform',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    const listingRepository = dataSource.getRepository(Listing);
    const reportRepository = dataSource.getRepository(Report);
    const userRepository = dataSource.getRepository(User);

    const listingCount = await listingRepository.count();
    const reportCount = await reportRepository.count();
    const userCount = await userRepository.count();

    console.log('📊 Database Statistics:');
    console.log(`   Listings: ${listingCount}`);
    console.log(`   Reports: ${reportCount}`);
    console.log(`   Users: ${userCount}\n`);

    if (listingCount > 0) {
      const activeListings = await listingRepository.count({ where: { isActive: true } });
      console.log(`   Active Listings: ${activeListings}`);
      
      const listings = await listingRepository.find({
        take: 5,
        relations: ['report', 'user'],
      });
      
      console.log('\n📋 Sample Listings:');
      listings.forEach((listing, index) => {
        console.log(`\n   ${index + 1}. Listing ID: ${listing.id}`);
        console.log(`      Price: $${listing.price} ${listing.currency}`);
        console.log(`      Location: ${listing.city}, ${listing.state}`);
        console.log(`      Active: ${listing.isActive}`);
        if (listing.report) {
          console.log(`      Car: ${listing.report.year} ${listing.report.make} ${listing.report.model}`);
        }
      });
    } else {
      console.log('⚠️  No listings found. Run the seed script:');
      console.log('   npm run seed:marketplace');
    }
  } catch (error) {
    console.error('❌ Error checking data:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

checkData();
