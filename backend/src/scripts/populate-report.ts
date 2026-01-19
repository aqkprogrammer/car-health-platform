import { DataSource } from 'typeorm';
import { Report } from '../reports/entities/report.entity';
import * as dotenv from 'dotenv';

dotenv.config();

// You can change this to populate a different report
const reportId = process.argv[2] || '2d3aed73-8e8d-481a-9039-a7722cdd9ed2';

async function populateReport() {
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
    console.log('Database connected');

    const reportRepository = dataSource.getRepository(Report);

    // Find the report
    const report = await reportRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      console.log(`Report with ID ${reportId} not found. Creating new report...`);
      
      // Create a new report with sample data
      const newReport = reportRepository.create({
        id: reportId,
        userId: '00000000-0000-0000-0000-000000000001', // Default user ID - update if needed
        make: 'Mercedes-Benz',
        model: 'C-Class',
        year: 2021,
        carDetails: {
          kilometersDriven: 28000,
          fuelType: 'Gasoline',
          transmission: 'Automatic',
          color: 'Black',
          ownershipCount: 1,
          vin: 'WDDWF4KB1MR123456',
          registrationNumber: 'FL-ABC123',
          city: 'Miami',
          state: 'Florida',
          country: 'USA',
          engine: '2.0L Turbo 4-Cylinder',
          drivetrain: 'RWD',
          condition: 'Excellent',
          features: [
            'Leather Seats',
            'Sunroof',
            'Navigation System',
            'Bluetooth',
            'Backup Camera',
            'Cruise Control',
            'Keyless Entry',
            'Premium Sound System',
          ],
        },
        media: {
          images: [
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1606664515524-9f283c033ba2?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
          ],
          videos: [],
        },
        aiAnalysis: {
          overallScore: 88,
          status: 'completed',
          summary: 'Excellent condition Mercedes-Benz C-Class with low mileage and comprehensive maintenance records. The vehicle shows minimal wear and has been well-maintained by a single owner.',
          highlights: [
            {
              type: 'positive',
              title: 'Low Mileage',
              description: 'Only 28,000 km driven, well below average for a 2021 vehicle',
              icon: '✨',
            },
            {
              type: 'positive',
              title: 'Single Owner',
              description: 'Vehicle has been owned by one person since new, ensuring consistent care',
              icon: '✓',
            },
            {
              type: 'positive',
              title: 'Excellent Maintenance',
              description: 'Complete service history with all scheduled maintenance performed on time',
              icon: '🔧',
            },
            {
              type: 'positive',
              title: 'No Accidents',
              description: 'Clean vehicle history report with no accidents or major repairs',
              icon: '🛡️',
            },
          ],
          issues: [
            {
              type: 'warning',
              title: 'Minor Scratches',
              description: 'Small scratches on rear bumper, cosmetic only',
              severity: 'low',
              icon: '⚠️',
            },
          ],
          recommendations: [
            'Continue regular maintenance schedule',
            'Consider ceramic coating for paint protection',
            'Tire rotation recommended at next service',
          ],
          sections: {
            exterior: {
              score: 90,
              label: 'Exterior',
              details: ['Paint in excellent condition', 'No dents or major scratches', 'All lights functioning properly'],
              issues: [],
            },
            interior: {
              score: 92,
              label: 'Interior',
              details: ['Leather seats in excellent condition', 'No stains or tears', 'All electronics working'],
              issues: [],
            },
            engine: {
              score: 85,
              label: 'Engine',
              details: ['Engine runs smoothly', 'No unusual noises', 'Regular oil changes performed'],
              issues: [
                {
                  title: 'Minor oil leak',
                  description: 'Very small oil leak detected, monitor closely',
                  severity: 'low',
                },
              ],
            },
            transmission: {
              score: 88,
              label: 'Transmission',
              details: ['Smooth shifting', 'No slipping', 'Transmission fluid changed regularly'],
              issues: [],
            },
            suspension: {
              score: 87,
              label: 'Suspension',
              details: ['Ride quality is good', 'No unusual noises', 'Shocks in good condition'],
              issues: [],
            },
            brakes: {
              score: 90,
              label: 'Brakes',
              details: ['Brake pads have 70% life remaining', 'No brake noise', 'Brake fluid changed recently'],
              issues: [],
            },
          },
        },
        trustScore: 88.5,
        verdict: 'excellent',
        status: 'completed',
      });

      await reportRepository.save(newReport);
      console.log('✅ Report created successfully with sample data!');
    } else {
      console.log(`Report found. Updating with sample data...`);
      
      // Update existing report
      report.make = 'Mercedes-Benz';
      report.model = 'C-Class';
      report.year = 2021;
      report.carDetails = {
        kilometersDriven: 28000,
        fuelType: 'Gasoline',
        transmission: 'Automatic',
        color: 'Black',
        ownershipCount: 1,
        vin: 'WDDWF4KB1MR123456',
        registrationNumber: 'FL-ABC123',
        city: 'Miami',
        state: 'Florida',
        country: 'USA',
        engine: '2.0L Turbo 4-Cylinder',
        drivetrain: 'RWD',
        condition: 'Excellent',
        features: [
          'Leather Seats',
          'Sunroof',
          'Navigation System',
          'Bluetooth',
          'Backup Camera',
          'Cruise Control',
          'Keyless Entry',
          'Premium Sound System',
        ],
      };
      report.media = {
        images: [
          'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1606664515524-9f283c033ba2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
        ],
        videos: [],
      };
      report.aiAnalysis = {
        overallScore: 88,
        status: 'completed',
        summary: 'Excellent condition Mercedes-Benz C-Class with low mileage and comprehensive maintenance records. The vehicle shows minimal wear and has been well-maintained by a single owner.',
        highlights: [
          {
            type: 'positive',
            title: 'Low Mileage',
            description: 'Only 28,000 km driven, well below average for a 2021 vehicle',
            icon: '✨',
          },
          {
            type: 'positive',
            title: 'Single Owner',
            description: 'Vehicle has been owned by one person since new, ensuring consistent care',
            icon: '✓',
          },
          {
            type: 'positive',
            title: 'Excellent Maintenance',
            description: 'Complete service history with all scheduled maintenance performed on time',
            icon: '🔧',
          },
          {
            type: 'positive',
            title: 'No Accidents',
            description: 'Clean vehicle history report with no accidents or major repairs',
            icon: '🛡️',
          },
        ],
        issues: [
          {
            type: 'warning',
            title: 'Minor Scratches',
            description: 'Small scratches on rear bumper, cosmetic only',
            severity: 'low',
            icon: '⚠️',
          },
        ],
        recommendations: [
          'Continue regular maintenance schedule',
          'Consider ceramic coating for paint protection',
          'Tire rotation recommended at next service',
        ],
        sections: {
          exterior: {
            score: 90,
            label: 'Exterior',
            details: ['Paint in excellent condition', 'No dents or major scratches', 'All lights functioning properly'],
            issues: [],
          },
          interior: {
            score: 92,
            label: 'Interior',
            details: ['Leather seats in excellent condition', 'No stains or tears', 'All electronics working'],
            issues: [],
          },
          engine: {
            score: 85,
            label: 'Engine',
            details: ['Engine runs smoothly', 'No unusual noises', 'Regular oil changes performed'],
            issues: [
              {
                title: 'Minor oil leak',
                description: 'Very small oil leak detected, monitor closely',
                severity: 'low',
              },
            ],
          },
          transmission: {
            score: 88,
            label: 'Transmission',
            details: ['Smooth shifting', 'No slipping', 'Transmission fluid changed regularly'],
            issues: [],
          },
          suspension: {
            score: 87,
            label: 'Suspension',
            details: ['Ride quality is good', 'No unusual noises', 'Shocks in good condition'],
            issues: [],
          },
          brakes: {
            score: 90,
            label: 'Brakes',
            details: ['Brake pads have 70% life remaining', 'No brake noise', 'Brake fluid changed recently'],
            issues: [],
          },
        },
      };
      report.trustScore = 88.5;
      report.verdict = 'excellent';
      report.status = 'completed';

      await reportRepository.save(report);
      console.log('✅ Report updated successfully with sample data!');
    }

    // Verify the update
    const updatedReport = await reportRepository.findOne({
      where: { id: reportId },
    });

    console.log('\n📊 Report Data:');
    console.log('ID:', updatedReport?.id);
    console.log('Make:', updatedReport?.make);
    console.log('Model:', updatedReport?.model);
    console.log('Year:', updatedReport?.year);
    console.log('Trust Score:', updatedReport?.trustScore);
    console.log('Verdict:', updatedReport?.verdict);
    console.log('Status:', updatedReport?.status);
    console.log('\n✅ Done! Report is now populated with data.');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

populateReport();
