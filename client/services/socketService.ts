
import { Message } from '../types';

type Listener = (data: any) => void;

class SocketService {
  private listeners: Record<string, Listener[]> = {};

  connect() {
    console.log('Socket connecting (Mocked)...');
  }

  disconnect() {
    console.log('Socket disconnecting (Mocked)...');
  }

  on(event: string, callback: Listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== callback);
  }

  emit(event: string, data: any) {
    console.log(`Socket emitting: ${event}`, data);
    
    // Simulate server behavior for 'send_message'
    if (event === 'send_message') {
      const message = data as Message;
      
      // Simulate receipt ACK
      setTimeout(() => {
        this.trigger('message_received', { ...message, status: 'delivered' });
      }, 500);

      // Simulate a random auto-reply from the peer
      setTimeout(() => {
        const reply: Message = {
          id: `reply-${Date.now()}`,
          conversationId: message.conversationId,
          senderId: 'user-1', // Mocking Alice
          content: `I received your message: "${message.content}"`,
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        this.trigger('new_message', reply);
      }, 2000);
    }
  }

  private trigger(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(l => l(data));
    }
  }
}

export const socketService = new SocketService();
