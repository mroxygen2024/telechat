
import type { Conversation, Message, User } from '@/types';
import { requestJson } from '@/api/http';

type ApiUser = {
  _id: string;
  username: string;
};

type ApiConversation = {
  _id: string;
  participants: ApiUser[];
  unreadCount?: Record<string, number>;
};

type ApiMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy?: string[];
  deletedFor?: string[];
  isDeletedGlobally?: boolean;
};

const normalizeUser = (user: ApiUser): User => ({
  id: user._id,
  username: user.username,
  status: 'offline',
});

const normalizeMessage = (message: ApiMessage): Message => ({
  id: message._id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  content: message.content,
  timestamp: message.timestamp,
  readBy: message.readBy || [],
  deletedFor: message.deletedFor || [],
  isDeletedGlobally: message.isDeletedGlobally ?? false,
  status: 'delivered',
});

export const chatApi = {
  getUsers: async (search?: string): Promise<User[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const users = await requestJson<ApiUser[]>(`/users${query}`);
    return users.map(normalizeUser);
  },

  getConversations: async (userId: string): Promise<Conversation[]> => {
    const conversations = await requestJson<ApiConversation[]>('/conversations');

    return conversations.map((conversation) => {
      const unreadCountMap = conversation.unreadCount || {};
      const unreadCount = Number(unreadCountMap[userId] ?? 0);

      return {
        id: conversation._id,
        participants: (conversation.participants || []).map(normalizeUser),
        unreadCount,
      };
    });
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const messages = await requestJson<ApiMessage[]>(`/conversations/${conversationId}/messages`);
    return messages.map(normalizeMessage);
  },

  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const message = await requestJson<ApiMessage>(
      '/messages',
      {
        method: 'POST',
        body: JSON.stringify({ conversationId, content }),
      }
    );

    return normalizeMessage(message);
  },

  updateMessage: async (messageId: string, content: string): Promise<Message> => {
    const message = await requestJson<ApiMessage>(
      `/messages/${messageId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      }
    );

    return normalizeMessage(message);
  },

  deleteMessage: async (
    messageId: string,
    deleteType: 'me' | 'everyone'
  ): Promise<{ id: string; conversationId: string; deleteType: 'me' | 'everyone' }> => {
    const result = await requestJson<{ _id: string; conversationId: string; deleteType: 'me' | 'everyone' }>(
      `/messages/${messageId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ deleteType }),
      }
    );

    return {
      id: result._id,
      conversationId: result.conversationId,
      deleteType: result.deleteType,
    };
  },

  createConversation: async (participantId: string, userId: string): Promise<Conversation> => {
    const conversation = await requestJson<ApiConversation>(
      '/conversations',
      {
        method: 'POST',
        body: JSON.stringify({ participantId }),
      }
    );

    const unreadCountMap = conversation.unreadCount || {};
    const unreadCount = Number(unreadCountMap[userId] ?? 0);

    return {
      id: conversation._id,
      participants: (conversation.participants || []).map(normalizeUser),
      unreadCount,
    };
  },
};
