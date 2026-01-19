import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { OTP } from './entities/otp.entity';

@Injectable()
export class OTPService {
  constructor(
    @InjectRepository(OTP)
    private otpRepository: Repository<OTP>,
  ) {}

  /**
   * Generate a random 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP (mock implementation - in production, integrate with SMS service)
   * Currently hardcoded to 123456 for development
   */
  async sendOTP(phone: string): Promise<{ message: string; expiresIn: number }> {
    // Clean up expired OTPs
    await this.otpRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    // Hardcoded OTP for development - TODO: Replace with dynamic API integration
    const otp = '123456';
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes

    // Save OTP to database (for tracking purposes, but verification will accept hardcoded value)
    const otpRecord = this.otpRepository.create({
      phone,
      otp,
      expiresAt,
      isVerified: false,
    });

    await this.otpRepository.save(otpRecord);

    // Log the hardcoded OTP for development
    console.log(`[DEV OTP] Phone: ${phone}, OTP: ${otp} (hardcoded for development)`);

    return {
      message: 'OTP sent successfully',
      expiresIn: 600, // 10 minutes in seconds
    };
  }

  /**
   * Verify OTP
   * Only accepts hardcoded 123456 for development
   */
  async verifyOTP(phone: string, otp: string): Promise<boolean> {
    // Hardcoded OTP for development - Only 123456 is accepted
    const HARDCODED_OTP = '123456';
    
    if (otp !== HARDCODED_OTP) {
      throw new BadRequestException('Invalid OTP. Only 123456 is accepted.');
    }

    // Clean up any existing OTP records for this phone
    await this.otpRepository.delete({ phone });
    return true;
  }

  /**
   * Clean up expired OTPs (can be called by a cron job)
   */
  async cleanupExpiredOTPs(): Promise<void> {
    await this.otpRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
