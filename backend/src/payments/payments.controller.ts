import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Create payment checkout' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Checkout created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  async checkout(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentsService.createCheckout(createPaymentDto, req.user.userId);
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Get payment status' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getStatus(@Param('id') id: string) {
    return this.paymentsService.getStatus(id);
  }

  @Post('refund/:id')
  @ApiOperation({ summary: 'Process refund' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Refund cannot be processed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async refund(@Param('id') id: string, @Request() req) {
    return this.paymentsService.processRefund(id, req.user.userId);
  }
}
