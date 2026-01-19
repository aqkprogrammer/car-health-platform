export type MessageType = "text" | "image" | "report";

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: "buyer" | "seller" | "dealer";
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string; // Text content or image URL or report ID
  timestamp: string;
  status: MessageStatus;
  readAt?: string;
  imagePreview?: string;
  reportReference?: {
    reportId: string;
    carMake: string;
    carModel: string;
    trustScore: number;
  };
}

export interface Chat {
  id: string;
  participants: ChatParticipant[];
  listingId?: string;
  lastMessage?: ChatMessage;
  messages?: ChatMessage[];
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
