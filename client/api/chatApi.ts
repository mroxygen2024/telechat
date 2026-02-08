
import { Conversation, Message, User } from '../types';
import { requestJson } from './http';

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
};

const normalizeUser = (user: ApiUser): User => ({
  id: user._id,
  username: user.username,
});

const normalizeMessage = (message: ApiMessage): Message => ({
  id: message._id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  content: message.content,
  timestamp: message.timestamp,
  status: 'delivered',
});

export const chatApi = {
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
};
