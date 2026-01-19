"use client";

import { useState, useEffect, useRef } from "react";
import { Chat, ChatMessage, ChatParticipant, MessageStatus } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ChatWindowProps {
  chat: Chat;
  currentUserId: string;
  onSendMessage: (content: string, type: "text" | "image" | "report") => void;
  onSendImage: (file: File) => void;
  onSendReport: (reportId: string) => void;
  isLoading?: boolean;
  availableReports?: Array<{ id: string; carMake: string; carModel: string }>;
}

export default function ChatWindow({
  chat,
  currentUserId,
  onSendMessage,
  onSendImage,
  onSendReport,
  isLoading = false,
  availableReports = [],
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(chat.messages || []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Get other participant (not current user)
  const otherParticipant = chat.participants.find(
    (p) => p.id !== currentUserId
  ) || chat.participants[0];

  // Update messages when chat.messages changes
  useEffect(() => {
    if (chat.messages) {
      setMessages(chat.messages);
    }
  }, [chat.messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (
    content: string,
    type: "text" | "image" | "report"
  ) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      chatId: chat.id,
      senderId: currentUserId,
      type,
      content,
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    // Optimistically add message
    setMessages((prev) => [...prev, newMessage]);

    try {
      // Send message via API
      await onSendMessage(content, type);
      
      // Update message status to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: "sent" as MessageStatus }
            : msg
        )
      );
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
    }
  };

  const handleSendImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      handleSendMessage(imageUrl, "image");
    };
    reader.readAsDataURL(file);
  };

  const handleSendReport = (reportId: string) => {
    const report = availableReports.find((r) => r.id === reportId);
    if (report) {
      handleSendMessage(reportId, "report");
    }
  };

  return (
    <div className="flex h-[600px] flex-col rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {otherParticipant.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {otherParticipant.name}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {otherParticipant.role.charAt(0).toUpperCase() +
              otherParticipant.role.slice(1)}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <span className="mb-2 block text-4xl">💬</span>
              <p className="text-gray-600 dark:text-gray-400">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const sender = chat.participants.find(
                (p) => p.id === message.senderId
              ) || otherParticipant;
              const isOwnMessage = message.senderId === currentUserId;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  sender={sender}
                  isOwnMessage={isOwnMessage}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onSendImage={handleSendImage}
        onSendReport={handleSendReport}
        isLoading={isLoading}
        availableReports={availableReports}
      />
    </div>
  );
}
