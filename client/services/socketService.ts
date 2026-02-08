
import { io, type Socket } from 'socket.io-client';
import { getApiBaseUrl } from '../api/http';

type Listener = (data: any) => void;

class SocketService {
  private listeners: Record<string, Listener[]> = {};
  private socket: Socket | null = null;

  connect(token?: string) {
    if (this.socket) return;
    this.socket = io(getApiBaseUrl(), {
      auth: token ? { token } : undefined,
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error', error.message);
    });

    Object.entries(this.listeners).forEach(([event, callbacks]) => {
      callbacks.forEach((cb) => this.socket?.on(event, cb));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== callback);
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}

export const socketService = new SocketService();
