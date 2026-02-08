
import { Conversation, Message } from '../types';
import { DUMMY_CONVERSATIONS, DUMMY_MESSAGES } from '../constants';

export const chatApi = {
  getConversations: async (): Promise<Conversation[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return DUMMY_CONVERSATIONS;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return DUMMY_MESSAGES[conversationId] || [];
  }
};
