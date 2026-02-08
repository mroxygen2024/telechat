import React, { useEffect, useState } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useChatStore } from "./stores/useChatStore";
import { socketService } from "./services/socketService";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { chatApi } from "./api/chatApi";
import type { Message } from "./types";

const App: React.FC = () => {
  const { isAuthenticated, checkAuth, user, token, authError, clearAuthError } =
    useAuthStore();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const {
    upsertMessage,
    updateMessageStatus,
    updateLastMessage,
    setConversations,
    setMessages,
    setLoading,
  } = useChatStore();

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

      socketService.on("new_message", handleNewMessage);
      socketService.on("message_received", handleMessageReceived);

      return () => {
        socketService.off("new_message", handleNewMessage);
        socketService.off("message_received", handleMessageReceived);
        socketService.disconnect();
      };
    }
  }, [
    isAuthenticated,
    token,
    upsertMessage,
    updateLastMessage,
    updateMessageStatus,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const conversations = await chatApi.getConversations(user.id);
        if (!isMounted) return;
        setConversations(conversations);

        await Promise.all(
          conversations.map(async (conversation) => {
            const messages = await chatApi.getMessages(conversation.id);
            if (!isMounted) return;
            setMessages(conversation.id, messages);
            if (messages.length > 0) {
              const last = messages[messages.length - 1];
              updateLastMessage(conversation.id, last.content, last.timestamp);
            }
          }),
        );
      } catch (error) {
        console.error("Failed to load conversations", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [
    isAuthenticated,
    user?.id,
    setConversations,
    setMessages,
    updateLastMessage,
    setLoading,
  ]);

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
      <div className="flex w-full h-full max-w-[1600px] mx-auto shadow-2xl overflow-hidden">
        <Sidebar />
        <ChatWindow />
      </div>
    </div>
  );
};

export default App;
