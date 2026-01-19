import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SaveCarDto } from './dto/save-car.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(user.userId, updateUserDto);
    
    // Track activity
    await this.usersService.trackActivity(
      user.userId,
      'profile_updated' as any,
      'user',
      user.userId,
      { updatedFields: Object.keys(updateUserDto) },
      'Profile updated',
    );
    
    return updatedUser;
  }

  @Put('role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  async updateRole(@CurrentUser() user: any, @Body() updateRoleDto: UpdateRoleDto) {
    return this.usersService.updateRole(user.userId, updateRoleDto);
  }

  @Put('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 204, description: 'Password changed successfully' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(user.userId, changePasswordDto);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user account' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  async deleteAccount(@CurrentUser() user: any) {
    await this.usersService.softDelete(user.userId);
  }

  // Profile History Endpoints

  @Get('uploaded-cars')
  @ApiOperation({ summary: 'Get user uploaded cars (reports created by user)' })
  @ApiResponse({ status: 200, description: 'Uploaded cars retrieved successfully' })
  async getUploadedCars(@CurrentUser() user: any) {
    return this.usersService.getUploadedCars(user.userId);
  }

  @Get('purchased-reports')
  @ApiOperation({ summary: 'Get user purchased reports' })
  @ApiResponse({ status: 200, description: 'Purchased reports retrieved successfully' })
  async getPurchasedReports(@CurrentUser() user: any) {
    return this.usersService.getPurchasedReports(user.userId);
  }

  @Get('saved-cars')
  @ApiOperation({ summary: 'Get user saved cars' })
  @ApiResponse({ status: 200, description: 'Saved cars retrieved successfully' })
  async getSavedCars(@CurrentUser() user: any) {
    return this.usersService.getSavedCars(user.userId);
  }

  @Post('saved-cars')
  @ApiOperation({ summary: 'Save a car to user favorites' })
  @ApiResponse({ status: 201, description: 'Car saved successfully' })
  async saveCar(@CurrentUser() user: any, @Body() saveCarDto: SaveCarDto) {
    return this.usersService.saveCar(user.userId, saveCarDto);
  }

  @Delete('saved-cars/:listingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a car from saved cars' })
  @ApiResponse({ status: 204, description: 'Car unsaved successfully' })
  async unsaveCar(@CurrentUser() user: any, @Param('listingId') listingId: string) {
    await this.usersService.unsaveCar(user.userId, listingId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get user activity history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of activities to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of activities to skip' })
  @ApiResponse({ status: 200, description: 'Activity history retrieved successfully' })
  async getActivityHistory(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.usersService.getActivityHistory(
      user.userId,
      limit ? parseInt(limit.toString(), 10) : 50,
      offset ? parseInt(offset.toString(), 10) : 0,
    );
  }
}
