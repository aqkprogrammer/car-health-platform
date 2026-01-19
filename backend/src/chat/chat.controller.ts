import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Get all chats for current user' })
  @ApiResponse({ status: 200, description: 'Chats retrieved successfully' })
  async findAll(@Request() req) {
    return this.chatService.findAll(req.user.userId);
  }

  @Post('find-or-create')
  @ApiOperation({ summary: 'Find or create a chat with a seller' })
  @ApiBody({ type: CreateChatDto })
  @ApiResponse({ status: 200, description: 'Chat found or created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async findOrCreate(@Body() createChatDto: CreateChatDto, @Request() req) {
    return this.chatService.findOrCreate(
      createChatDto.sellerId,
      req.user.userId,
      createChatDto.listingId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific chat with messages' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 200, description: 'Chat retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.chatService.findOne(id, req.user.userId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in a chat' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async sendMessage(
    @Param('id') chatId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ) {
    return this.chatService.sendMessage(chatId, createMessageDto, req.user.userId);
  }
}
