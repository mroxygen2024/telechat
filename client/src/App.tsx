import React, { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useChatStore } from "./stores/useChatStore";
import { socketService } from "./services/socketService";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { chatApi } from "./api/chatApi";

import { GlobalErrorToast } from "./components/ui/GlobalErrorToast";
import { useErrorStore } from "./stores/useErrorStore";

const App: React.FC = () => {
  const { isAuthenticated, checkAuth, user, token, authError, clearAuthError } =
    useAuthStore();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const addError = useErrorStore((state) => state.addError);
  const {
    upsertMessage,
    updateLastMessage,
    setConversations,
    setMessages,
    setLoading,
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
      // interface SocketMessage would be defined here if needed for socket handlers
      // normalizeMessage would be defined here if needed for socket handlers
      // Socket event handlers would be registered here if needed
      socketService.connect(token);
      // ...register socket handlers as before...
    }
  }, [isAuthenticated, token, upsertMessage, updateLastMessage]);

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
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <GlobalErrorToast />
      <div className="flex flex-1 w-full h-full overflow-hidden">
        <Sidebar />
        <ChatWindow />
      </div>
    </div>
  );
};

export default App;