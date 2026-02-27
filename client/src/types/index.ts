// Add your shared types here and export them for use across the app.

export type User = {
  id: string;
  username: string;
  avatar?: string;
  status?: "online" | "offline" | "typing" | string;
}

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy: string[];
  deletedFor: string[];
  isDeletedGlobally: boolean;
  status: "delivered" | "sent" | "read";
}

export type Conversation = {
  id: string;
  participants: User[];
  lastMessage?: string;
  lastTimestamp?: string;
  unreadCount?: number;
}

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  authError: string | null;
}
