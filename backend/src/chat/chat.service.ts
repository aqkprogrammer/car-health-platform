import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async findAll(userId: string): Promise<Chat[]> {
    return this.chatRepository.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      relations: ['buyer', 'seller', 'listing'],
    });
  }

  async findOne(id: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id },
      relations: ['buyer', 'seller', 'listing', 'messages', 'messages.sender'],
    });
    
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    
    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      throw new ForbiddenException('You do not have permission to access this chat');
    }
    
    // Sort messages by createdAt ascending
    if (chat.messages && chat.messages.length > 0) {
      chat.messages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    
    return chat;
  }

  async findOrCreate(sellerId: string, buyerId: string, listingId?: string): Promise<Chat> {
    // First, try to find an existing chat
    const where: any = {
      buyerId,
      sellerId,
    };
    
    if (listingId) {
      where.listingId = listingId;
    }
    
    let chat = await this.chatRepository.findOne({
      where,
      relations: ['buyer', 'seller', 'listing'],
    });
    
    // If no chat exists, create a new one
    if (!chat) {
      chat = this.chatRepository.create({
        buyerId,
        sellerId,
        listingId: listingId || null,
      });
      chat = await this.chatRepository.save(chat);
      
      // Reload with relations
      chat = await this.chatRepository.findOne({
        where: { id: chat.id },
        relations: ['buyer', 'seller', 'listing'],
      });
    }
    
    return chat;
  }

  async sendMessage(chatId: string, createMessageDto: CreateMessageDto, userId: string): Promise<Message> {
    // Verify chat exists and user has access
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
    });
    
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    
    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      throw new ForbiddenException('You do not have permission to send messages in this chat');
    }
    
    const message = this.messageRepository.create({
      ...createMessageDto,
      chatId,
      senderId: userId,
    });
    return this.messageRepository.save(message);
  }
}
