import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useChatStore } from "./stores/useChatStore";
import { socketService } from "./services/socketService";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { chatApi } from "./api/chatApi";
import type { Message } from "./types";
import { GlobalErrorToast } from "./components/ui/GlobalErrorToast";
import { useErrorStore } from "./stores/useErrorStore";

const App: React.FC = () => {
  const { isAuthenticated, checkAuth, user, token, authError, clearAuthError } =
    useAuthStore();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const addError = useErrorStore((state) => state.addError);
  const {
    upsertMessage,
    updateMessageStatus,
    updateMessagesReadBy,
    updateLastMessage,
    setConversations,
    setMessages,
    setLoading,
    updateUserPresence,
    markMessageDeletedGlobally,
  } = useChatStore();

  const refreshChatState = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      setLoading(true);
      const conversations = await chatApi.getConversations(user.id);
      setConversations(conversations);

      await Promise.all(
        conversations.map(async (conversation) => {
          const messages = await chatApi.getMessages(conversation.id);
          setMessages(conversation.id, messages);
          if (messages.length > 0) {
            const last = messages[messages.length - 1];
            updateLastMessage(conversation.id, last.content, last.timestamp);
          }
        }),
      );
    } catch (error) {
      console.error("Failed to refresh conversations", error);
      addError("Failed to refresh conversations");
    } finally {
      setLoading(false);
    }
  }, [
    isAuthenticated,
    user?.id,
    setConversations,
    setMessages,
    updateLastMessage,
    setLoading,
    addError,
  ]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authError) {
      setAuthMode("login");
    }
  }, [authError]);

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);

      const normalizeMessage = (msg: any): Message => ({
        id: msg._id ?? msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content,
        timestamp: msg.timestamp,
        readBy: msg.readBy ?? [],
        deletedFor: msg.deletedFor ?? [],
        isDeletedGlobally: msg.isDeletedGlobally ?? false,
        status: msg.status ?? "delivered",
      });

      const handleNewMessage = (msg: any) => {
        const normalized = normalizeMessage(msg);
        upsertMessage(normalized.conversationId, normalized);
        updateLastMessage(
          normalized.conversationId,
          normalized.content,
          normalized.timestamp,
        );
      };

      const handleMessageReceived = (msg: any) => {
        const normalized = normalizeMessage(msg);
        updateMessageStatus(
          normalized.conversationId,
          normalized.id,
          "delivered",
        );
      };

      const handleMessageRead = (payload: {
        conversationId: string;
        readerId: string;
        messageIds?: string[];
      }) => {
        if (!payload.messageIds?.length) return;
        updateMessagesReadBy(
          payload.conversationId,
          payload.messageIds,
          payload.readerId,
          user?.id,
        );
      };

      const handlePresenceUpdate = (payload: {
        userId: string;
        status: "online" | "offline";
      }) => {
        updateUserPresence(payload.userId, payload.status);
      };

      const handleMessageDeletedGlobally = (payload: {
        messageId: string;
        conversationId: string;
      }) => {
        markMessageDeletedGlobally(payload.conversationId, payload.messageId);
      };

      const handleMissedMessages = (payload: { messages: any[] }) => {
        payload.messages.forEach((msg) => {
          const normalized = normalizeMessage(msg);
          upsertMessage(normalized.conversationId, normalized);

          const { conversations } = useChatStore.getState();
          const conversation = conversations.find(
            (item) => item.id === normalized.conversationId,
          );
          const currentTimestamp = conversation?.lastTimestamp
            ? new Date(conversation.lastTimestamp).getTime()
            : 0;
          const incomingTimestamp = new Date(normalized.timestamp).getTime();
          if (incomingTimestamp >= currentTimestamp) {
            updateLastMessage(
              normalized.conversationId,
              normalized.content,
              normalized.timestamp,
            );
          }
        });
      };

      const handleSocketConnect = () => {
        refreshChatState();
      };

      socketService.on("new_message", handleNewMessage);
      socketService.on("message_received", handleMessageReceived);
      socketService.on("message_read", handleMessageRead);
      socketService.on("presence_update", handlePresenceUpdate);
      socketService.on(
        "message_deleted_globally",
        handleMessageDeletedGlobally,
      );
      socketService.on("missed_messages", handleMissedMessages);
      socketService.on("connect", handleSocketConnect);

      return () => {
        socketService.off("new_message", handleNewMessage);
        socketService.off("message_received", handleMessageReceived);
        socketService.off("message_read", handleMessageRead);
        socketService.off("presence_update", handlePresenceUpdate);
        socketService.off(
          "message_deleted_globally",
          handleMessageDeletedGlobally,
        );
        socketService.off("missed_messages", handleMissedMessages);
        socketService.off("connect", handleSocketConnect);
        socketService.disconnect();
      };
    }
  }, [
    isAuthenticated,
    token,
    upsertMessage,
    updateLastMessage,
    updateMessageStatus,
    updateMessagesReadBy,
    user?.id,
    updateUserPresence,
    markMessageDeletedGlobally,
    refreshChatState,
  ]);

  useEffect(() => {
    refreshChatState();
  }, [refreshChatState]);

  if (!isAuthenticated) {
    return authMode === "signup" ? (
      <SignupPage
        onSwitchToLogin={() => {
          clearAuthError();
          setAuthMode("login");
        }}
      />
    ) : (
      <LoginPage
        onSwitchToSignup={() => {
          clearAuthError();
          setAuthMode("signup");
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
      <GlobalErrorToast />
      <div className="flex w-full h-full max-w-[1600px] mx-auto shadow-2xl overflow-hidden">
        <Sidebar />
        <ChatWindow />
      </div>
    </div>
  );
};

export default App;
