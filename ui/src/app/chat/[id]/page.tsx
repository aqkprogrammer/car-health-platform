"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { chatApi, reportsApi } from "@/lib/api";
import ChatWindow from "@/components/chat/ChatWindow";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Chat, ChatParticipant, ChatMessage, MessageStatus } from "@/types/chat";
import Link from "next/link";
import Nav from "@/components/ui/Nav";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableReports, setAvailableReports] = useState<Array<{ id: string; carMake: string; carModel: string }>>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    const loadChat = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const chatId = params.id as string;
        const chatData = await chatApi.getById(chatId);
        
        // Transform backend data (buyer/seller) to participants array
        const participants: ChatParticipant[] = [];
        if (chatData.buyer) {
          participants.push({
            id: chatData.buyerId || chatData.buyer.id,
            name: chatData.buyer.firstName || chatData.buyer.name || chatData.buyer.email || chatData.buyer.phone || "Buyer",
            role: "buyer",
            avatar: chatData.buyer.avatar,
          });
        } else if (chatData.buyerId) {
          // Fallback if buyer relation not loaded
          participants.push({
            id: chatData.buyerId,
            name: "Buyer",
            role: "buyer",
          });
        }
        if (chatData.seller) {
          participants.push({
            id: chatData.sellerId || chatData.seller.id,
            name: chatData.seller.firstName || chatData.seller.name || chatData.seller.email || chatData.seller.phone || "Seller",
            role: chatData.seller.role === "dealer" ? "dealer" : "seller",
            avatar: chatData.seller.avatar,
          });
        } else if (chatData.sellerId) {
          // Fallback if seller relation not loaded
          participants.push({
            id: chatData.sellerId,
            name: "Seller",
            role: "seller",
          });
        }
        
        // Ensure we have at least the current user as a participant
        if (participants.length === 0 && user) {
          participants.push({
            id: user.id,
            name: user.firstName || user.name || user.email || "You",
            role: "buyer",
          });
        }
        
        // Transform messages from backend format to frontend format
        const transformedMessages: ChatMessage[] = await Promise.all(
          (chatData.messages || []).map(async (msg: any) => {
            let reportReference = undefined;
            
            // If message has reportId, fetch report details
            if (msg.reportId) {
              try {
                const report = await reportsApi.getById(msg.reportId);
                reportReference = {
                  reportId: msg.reportId,
                  carMake: report.make || report.carDetails?.make || "",
                  carModel: report.model || report.carDetails?.model || "",
                  trustScore: report.trustScore != null ? Number(report.trustScore) : 0,
                };
              } catch (err) {
                console.error("Error loading report details:", err);
                // Still include report reference with minimal info
                reportReference = {
                  reportId: msg.reportId,
                  carMake: "",
                  carModel: "",
                  trustScore: 0,
                };
              }
            }
            
            return {
              id: msg.id,
              chatId: msg.chatId || chatData.id,
              senderId: msg.senderId,
              type: msg.type || "text",
              content: msg.content,
              timestamp: msg.createdAt || new Date().toISOString(),
              status: "read" as MessageStatus,
              readAt: msg.readAt || msg.createdAt,
              reportReference,
            };
          })
        );
        
        // Transform API data to match Chat type
        const transformedChat: Chat = {
          id: chatData.id,
          participants,
          listingId: chatData.listingId,
          unreadCount: chatData.unreadCount || 0,
          createdAt: chatData.createdAt,
          updatedAt: chatData.updatedAt || chatData.createdAt,
          messages: transformedMessages,
        };
        
        setChat(transformedChat);
        
        // Load available reports for current user
        try {
          const reports = await reportsApi.getAll();
          setAvailableReports(
            reports.map((r: any) => ({
              id: r.id,
              carMake: r.make || r.carDetails?.make,
              carModel: r.model || r.carDetails?.model,
            }))
          );
        } catch (err) {
          console.error("Error loading reports:", err);
        }
      } catch (err: any) {
        console.error("Error loading chat:", err);
        setError(err.message || "Failed to load chat");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadChat();
    }
  }, [isAuthenticated, router, user, params.id]);

  const handleSendMessage = async (
    content: string,
    type: "text" | "image" | "report"
  ) => {
    if (!chat || !params.id) return;
    
    try {
      // For report type, content is the reportId
      const messageData: any = {
        content: type === "report" ? `Report: ${content}` : content,
        type: type === "text" ? "text" : type === "image" ? "image" : "report",
      };
      
      // Add reportId for report messages
      if (type === "report") {
        messageData.reportId = content;
      }
      
      await chatApi.sendMessage(params.id as string, messageData);
      
      // Reload chat to get updated messages
      const chatData = await chatApi.getById(params.id as string);
      
      // Transform backend data (buyer/seller) to participants array
      const participants: ChatParticipant[] = [];
      if (chatData.buyer) {
        participants.push({
          id: chatData.buyerId || chatData.buyer.id,
          name: chatData.buyer.firstName || chatData.buyer.name || chatData.buyer.email || chatData.buyer.phone || "Buyer",
          role: "buyer",
          avatar: chatData.buyer.avatar,
        });
      } else if (chatData.buyerId) {
        participants.push({
          id: chatData.buyerId,
          name: "Buyer",
          role: "buyer",
        });
      }
      if (chatData.seller) {
        participants.push({
          id: chatData.sellerId || chatData.seller.id,
          name: chatData.seller.firstName || chatData.seller.name || chatData.seller.email || chatData.seller.phone || "Seller",
          role: chatData.seller.role === "dealer" ? "dealer" : "seller",
          avatar: chatData.seller.avatar,
        });
      } else if (chatData.sellerId) {
        participants.push({
          id: chatData.sellerId,
          name: "Seller",
          role: "seller",
        });
      }
      
      // Ensure we have at least the current user as a participant
      if (participants.length === 0 && user) {
        participants.push({
          id: user.id,
          name: user.firstName || user.name || user.email || "You",
          role: "buyer",
        });
      }
      
      // Transform messages from backend format to frontend format
      const transformedMessages: ChatMessage[] = await Promise.all(
        (chatData.messages || []).map(async (msg: any) => {
          let reportReference = undefined;
          
          // If message has reportId, fetch report details
          if (msg.reportId) {
            try {
              const report = await reportsApi.getById(msg.reportId);
              reportReference = {
                reportId: msg.reportId,
                carMake: report.make || report.carDetails?.make || "",
                carModel: report.model || report.carDetails?.model || "",
                trustScore: report.trustScore != null ? Number(report.trustScore) : 0,
              };
            } catch (err) {
              console.error("Error loading report details:", err);
              // Still include report reference with minimal info
              reportReference = {
                reportId: msg.reportId,
                carMake: "",
                carModel: "",
                trustScore: 0,
              };
            }
          }
          
          return {
            id: msg.id,
            chatId: msg.chatId || chatData.id,
            senderId: msg.senderId,
            type: msg.type || "text",
            content: msg.content,
            timestamp: msg.createdAt || new Date().toISOString(),
            status: "read" as MessageStatus,
            readAt: msg.readAt || msg.createdAt,
            reportReference,
          };
        })
      );
      
      const transformedChat: Chat = {
        id: chatData.id,
        participants,
        listingId: chatData.listingId,
        unreadCount: chatData.unreadCount || 0,
        createdAt: chatData.createdAt,
        updatedAt: chatData.updatedAt || chatData.createdAt,
        messages: transformedMessages,
      };
      setChat(transformedChat);
    } catch (err: any) {
      console.error("Error sending message:", err);
      throw err;
    }
  };

  const handleSendImage = async (file: File) => {
    // TODO: Upload image first, then send message with image URL
    console.log("Sending image:", file.name);
    // For now, just send as text message
    await handleSendMessage(`[Image: ${file.name}]`, "text");
  };

  const handleSendReport = async (reportId: string) => {
    await handleSendMessage(reportId, "report");
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || (!chat && !isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {error || "Chat Not Found"}
          </h1>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {error || "The chat you're looking for doesn't exist or you don't have access to it."}
          </p>
          <Link
            href="/marketplace"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (!chat || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <Nav />
      {/* Additional Actions */}
      {chat.listingId && (
        <div className="container mx-auto px-4 pt-4">
          <Link
            href={`/marketplace/${chat.listingId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105 shadow-md border border-gray-200 dark:border-slate-700"
          >
            View Listing
          </Link>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <ChatWindow
            chat={chat}
            currentUserId={user.id}
            onSendMessage={handleSendMessage}
            onSendImage={handleSendImage}
            onSendReport={handleSendReport}
            availableReports={availableReports}
          />
        </div>
      </main>
    </div>
  );
}
