import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DealerService } from './dealer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dealer')
@Controller('dealer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DealerController {
  constructor(private readonly dealerService: DealerService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dealer dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - user is not a dealer' })
  async getDashboard(@Request() req) {
    return this.dealerService.getDashboard(req.user.userId);
  }

  @Get('subscription')
  @ApiOperation({ summary: 'Get dealer subscription details' })
  @ApiResponse({ status: 200, description: 'Subscription details retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - user is not a dealer' })
  async getSubscription(@Request() req) {
    return this.dealerService.getSubscription(req.user.userId);
  }

  @Post('bulk-upload')
  @ApiOperation({ summary: 'Bulk upload cars via CSV' })
  @ApiResponse({ status: 201, description: 'Bulk upload initiated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - user is not a dealer' })
  async bulkUpload(@Request() req) {
    // TODO: Handle file upload
    return { message: 'Bulk upload endpoint' };
  }
}
