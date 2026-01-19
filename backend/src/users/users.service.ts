import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SavedCar } from './entities/saved-car.entity';
import { UserActivity, ActivityType } from './entities/user-activity.entity';
import { PurchasedReport } from './entities/purchased-report.entity';
import { Report } from '../reports/entities/report.entity';
import { Listing } from '../marketplace/entities/listing.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SaveCarDto } from './dto/save-car.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(SavedCar)
    private savedCarRepository: Repository<SavedCar>,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
    @InjectRepository(PurchasedReport)
    private purchasedReportRepository: Repository<PurchasedReport>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Listing)
    private listingRepository: Repository<Listing>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    // Validate that at least email or phone is provided
    if (!registerDto.email && !registerDto.phone) {
      throw new BadRequestException('Either email or phone number is required');
    }

    // Validate that password is provided if email is provided
    if (registerDto.email && !registerDto.password) {
      throw new BadRequestException('Password is required when registering with email');
    }

    // Check if email or phone already exists
    if (registerDto.email) {
      const existingEmail = await this.findByEmail(registerDto.email);
      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (registerDto.phone) {
      const existingPhone = await this.findByPhone(registerDto.phone);
      if (existingPhone) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    const hashedPassword = registerDto.password
      ? await bcrypt.hash(registerDto.password, 10)
      : null;

    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || 'buyer' as any,
    });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email }, withDeleted: false });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone }, withDeleted: false });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      withDeleted: false,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Check if phone is being changed and if it's already taken
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingUser = await this.findByPhone(updateUserDto.phone);
      if (existingUser) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<User> {
    const user = await this.findOne(id);
    user.role = updateRoleDto.role;
    return this.usersRepository.save(user);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.findOne(id);

    if (!user.password) {
      throw new BadRequestException('User does not have a password set');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.save(user);
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async findByIdOrCreate(identifier: { email?: string; phone?: string; role?: string }): Promise<User> {
    let user: User | null = null;

    if (identifier.email) {
      user = await this.findByEmail(identifier.email);
    }

    if (!user && identifier.phone) {
      user = await this.findByPhone(identifier.phone);
    }

    if (!user) {
      // Create user without password (for OTP-based login)
      // Use provided role or default to 'buyer'
      const role = (identifier.role && ['buyer', 'seller', 'dealer'].includes(identifier.role)) 
        ? identifier.role as any 
        : 'buyer' as any;
      
      user = await this.create({
        email: identifier.email,
        phone: identifier.phone,
        password: '', // Will be set later if needed
        role,
      });
    } else if (identifier.role && ['buyer', 'seller', 'dealer'].includes(identifier.role)) {
      // Update existing user's role if provided and different
      if (user.role !== identifier.role) {
        user.role = identifier.role as any;
        await this.usersRepository.save(user);
      }
    }

    return user;
  }

  // Profile History Methods

  async getUploadedCars(userId: string): Promise<Report[]> {
    return this.reportRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPurchasedReports(userId: string): Promise<PurchasedReport[]> {
    return this.purchasedReportRepository.find({
      where: { userId },
      relations: ['report'],
      order: { purchasedAt: 'DESC' },
    });
  }

  async getSavedCars(userId: string): Promise<SavedCar[]> {
    return this.savedCarRepository.find({
      where: { userId },
      relations: ['listing', 'listing.report'],
      order: { createdAt: 'DESC' },
    });
  }

  async saveCar(userId: string, saveCarDto: SaveCarDto): Promise<SavedCar> {
    // Check if listing exists
    const listing = await this.listingRepository.findOne({
      where: { id: saveCarDto.listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Check if already saved
    const existing = await this.savedCarRepository.findOne({
      where: { userId, listingId: saveCarDto.listingId },
    });

    if (existing) {
      throw new BadRequestException('Car is already saved');
    }

    const savedCar = this.savedCarRepository.create({
      userId,
      listingId: saveCarDto.listingId,
      notes: saveCarDto.notes,
    });

    const saved = await this.savedCarRepository.save(savedCar);

    // Track activity
    await this.trackActivity(userId, ActivityType.CAR_SAVED, 'listing', saveCarDto.listingId);

    return saved;
  }

  async unsaveCar(userId: string, listingId: string): Promise<void> {
    const savedCar = await this.savedCarRepository.findOne({
      where: { userId, listingId },
    });

    if (!savedCar) {
      throw new NotFoundException('Saved car not found');
    }

    await this.savedCarRepository.remove(savedCar);

    // Track activity
    await this.trackActivity(userId, ActivityType.CAR_UNSAVED, 'listing', listingId);
  }

  async trackActivity(
    userId: string,
    type: ActivityType,
    entityType?: string,
    entityId?: string,
    metadata?: any,
    description?: string,
  ): Promise<UserActivity> {
    const activity = this.userActivityRepository.create({
      userId,
      type,
      entityType,
      entityId,
      metadata,
      description,
    });

    return this.userActivityRepository.save(activity);
  }

  async getActivityHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ activities: UserActivity[]; total: number }> {
    const [activities, total] = await this.userActivityRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { activities, total };
  }
}
