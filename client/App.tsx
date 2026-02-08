
import React, { useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { useChatStore } from './stores/useChatStore';
import { socketService } from './services/socketService';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';

const App: React.FC = () => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { addMessage, updateLastMessage } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();

      const handleNewMessage = (msg: any) => {
        addMessage(msg.conversationId, msg);
        updateLastMessage(msg.conversationId, msg.content, msg.timestamp);
      };

      const handleMessageReceived = (msg: any) => {
        // Logic to update UI with double checks or status could go here
        console.log('Message delivered ACK:', msg.id);
      };

      socketService.on('new_message', handleNewMessage);
      socketService.on('message_received', handleMessageReceived);

      return () => {
        socketService.off('new_message', handleNewMessage);
        socketService.off('message_received', handleMessageReceived);
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, addMessage, updateLastMessage]);

  if (!isAuthenticated) {
    return <LoginPage />;
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
