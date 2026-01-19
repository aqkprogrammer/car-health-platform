import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UsersService } from '../users/users.service';
import { PurchasedReport } from '../users/entities/purchased-report.entity';
import { ActivityType } from '../users/entities/user-activity.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(PurchasedReport)
    private purchasedReportRepository: Repository<PurchasedReport>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async createCheckout(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      userId,
      status: 'pending',
    });
    return this.paymentRepository.save(payment);
  }

  async markAsCompleted(paymentId: string, transactionId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = 'completed';
    payment.transactionId = transactionId;
    const savedPayment = await this.paymentRepository.save(payment);

    // If payment is for a report, create purchased report record
    if (payment.type === 'report') {
      const purchasedReport = this.purchasedReportRepository.create({
        userId: payment.userId,
        reportId: payment.reportId,
        amountPaid: payment.amount,
        currency: payment.currency,
        paymentId: payment.id,
      });
      await this.purchasedReportRepository.save(purchasedReport);

      // Track activity
      await this.usersService.trackActivity(
        payment.userId,
        ActivityType.REPORT_PURCHASED,
        'report',
        payment.reportId,
        {
          amount: payment.amount,
          currency: payment.currency,
          paymentId: payment.id,
        },
        `Purchased health report`,
      );
    }

    return savedPayment;
  }

  async getStatus(id: string): Promise<Payment> {
    return this.paymentRepository.findOne({ where: { id } });
  }

  async processRefund(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id, userId } });
    if (!payment) {
      throw new Error('Payment not found');
    }
    payment.status = 'refunded';
    return this.paymentRepository.save(payment);
  }
}
