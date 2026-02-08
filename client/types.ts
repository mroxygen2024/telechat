
export interface User {
  id: string;
  username: string;
  avatar?: string;
  status?: 'online' | 'offline';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy: string[];
  deletedFor: string[];
  isDeletedGlobally: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: string;
  lastTimestamp?: string;
  unreadCount: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  authError?: string | null;
}
