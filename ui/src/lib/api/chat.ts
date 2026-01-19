import { apiClient } from './client';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  REPORT = 'report',
}

export interface CreateMessageDto {
  content: string;
  type?: MessageType;
  reportId?: string;
}

export interface CreateChatDto {
  sellerId: string;
  listingId?: string;
}

export const chatApi = {
  /**
   * Get all chats for current user
   */
  async getAll(): Promise<any[]> {
    try {
      const response = await apiClient.get('/chat');
      if (response.error) {
        let errorMessage = 'Failed to fetch chats';
        if (response.error && typeof response.error === 'object' && 'message' in response.error) {
          errorMessage = String(response.error.message) || errorMessage;
        } else if (response.error) {
          errorMessage = String(response.error) || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return response.data || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error) || 'Failed to fetch chats');
    }
  },

  /**
   * Get a specific chat with messages by chat ID
   */
  async getById(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/chat/${id}`);
      if (response.error) {
        let errorMessage = 'Failed to fetch chat';
        if (response.error && typeof response.error === 'object' && 'message' in response.error) {
          errorMessage = String(response.error.message) || errorMessage;
        } else if (response.error) {
          errorMessage = String(response.error) || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return response.data;
    } catch (error) {
      // Re-throw if it's already an Error, otherwise wrap it
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error) || 'Failed to fetch chat');
    }
  },

  /**
   * Find or create a chat with a seller
   */
  async findOrCreate(data: CreateChatDto): Promise<any> {
    try {
      const response = await apiClient.post('/chat/find-or-create', data);
      if (response.error) {
        let errorMessage = 'Failed to create chat';
        if (response.error && typeof response.error === 'object' && 'message' in response.error) {
          errorMessage = String(response.error.message) || errorMessage;
        } else if (response.error) {
          errorMessage = String(response.error) || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error) || 'Failed to create chat');
    }
  },

  /**
   * Send a message in a chat
   */
  async sendMessage(chatId: string, data: CreateMessageDto): Promise<any> {
    try {
      const response = await apiClient.post(`/chat/${chatId}/messages`, data);
      if (response.error) {
        let errorMessage = 'Failed to send message';
        if (response.error && typeof response.error === 'object' && 'message' in response.error) {
          errorMessage = String(response.error.message) || errorMessage;
        } else if (response.error) {
          errorMessage = String(response.error) || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(String(error) || 'Failed to send message');
    }
  },
};
