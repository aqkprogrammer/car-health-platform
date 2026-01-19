import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { RequestUploadDto } from './dto/request-upload.dto';
import { RegisterMediaDto } from './dto/register-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('media')
@Controller('cars/:carId/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Request upload authorization (presigned URL)' })
  @ApiParam({ name: 'carId', description: 'Car ID' })
  @ApiResponse({ status: 201, description: 'Upload authorization granted' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the car owner' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async requestUploadAuthorization(
    @Param('carId') carId: string,
    @CurrentUser() user: any,
    @Body() requestUploadDto: RequestUploadDto,
  ) {
    return this.mediaService.requestUploadAuthorization(
      carId,
      requestUploadDto,
      user.userId,
    );
  }

  @Put(':mediaId/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register media metadata after upload' })
  @ApiParam({ name: 'carId', description: 'Car ID' })
  @ApiParam({ name: 'mediaId', description: 'Media ID from upload request' })
  @ApiResponse({ status: 200, description: 'Media registered successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async registerMedia(
    @Param('carId') carId: string,
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: any,
    @Body() registerMediaDto: RegisterMediaDto,
  ) {
    return this.mediaService.registerMedia(carId, mediaId, registerMediaDto, user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all media for a car' })
  @ApiParam({ name: 'carId', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Media list retrieved successfully' })
  async getMediaByCar(
    @Param('carId') carId: string,
    @CurrentUser() user: any,
  ) {
    return this.mediaService.getMediaByCar(carId, user.userId);
  }

  @Get('checklist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get required media checklist and guidance' })
  @ApiParam({ name: 'carId', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Checklist retrieved successfully' })
  async getRequiredMediaChecklist(
    @Param('carId') carId: string,
    @CurrentUser() user: any,
  ) {
    return this.mediaService.getRequiredMediaChecklist(carId, user.userId);
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Validate required media presence with warnings' })
  @ApiParam({ name: 'carId', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Validation result with warnings' })
  async validateRequiredMedia(
    @Param('carId') carId: string,
    @CurrentUser() user: any,
  ) {
    return this.mediaService.validateRequiredMedia(carId, user.userId);
  }

  @Delete(':mediaId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete media' })
  @ApiParam({ name: 'carId', description: 'Car ID' })
  @ApiParam({ name: 'mediaId', description: 'Media ID' })
  @ApiResponse({ status: 204, description: 'Media deleted successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async deleteMedia(
    @Param('carId') carId: string,
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: any,
  ) {
    await this.mediaService.deleteMedia(carId, mediaId, user.userId);
  }

  @Post(':mediaId/replace')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Replace media (delete old and request new upload)' })
  @ApiParam({ name: 'carId', description: 'Car ID' })
  @ApiParam({ name: 'mediaId', description: 'Media ID to replace' })
  @ApiResponse({ status: 201, description: 'Replacement upload authorization granted' })
  async replaceMedia(
    @Param('carId') carId: string,
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: any,
    @Body() requestUploadDto: RequestUploadDto,
  ) {
    return this.mediaService.replaceMedia(carId, mediaId, requestUploadDto, user.userId);
  }

  @Post(':mediaId/upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file directly through backend (bypasses CORS)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'carId', description: 'Car ID' })
  @ApiParam({ name: 'mediaId', description: 'Media ID from upload request' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or upload failed' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async uploadFile(
    @Param('carId') carId: string,
    @Param('mediaId') mediaId: string,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.mediaService.uploadFile(carId, mediaId, file, user.userId);
  }

  @Get('files/:carId/:type/:fileName')
  @ApiOperation({ summary: 'Serve media files (local storage only) - Public endpoint' })
  @ApiParam({ name: 'carId', description: 'Car ID' })
  @ApiParam({ name: 'type', description: 'Media type (photos or videos)' })
  @ApiParam({ name: 'fileName', description: 'File name' })
  @ApiResponse({ status: 200, description: 'File served successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async serveFile(
    @Param('carId') carId: string,
    @Param('type') type: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    // Public endpoint - no auth required for image serving
    // Ownership is verified by checking if file exists and matches carId
    const fileData = await this.mediaService.serveLocalFile(carId, type, fileName);
    
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileData.fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.send(fileData.file);
  }
}
