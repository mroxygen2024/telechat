
import { create } from 'zustand';
import { Conversation, Message } from '../types';
import { DUMMY_CONVERSATIONS, DUMMY_MESSAGES } from '../constants';

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  
  setConversations: (convs: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (convId: string, message: Message) => void;
  updateLastMessage: (convId: string, text: string, timestamp: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: DUMMY_CONVERSATIONS,
  activeConversationId: null,
  messages: DUMMY_MESSAGES,
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (id) => set({ activeConversationId: id }),
  
  addMessage: (convId, message) => set((state) => {
    const existingMessages = state.messages[convId] || [];
    return {
      messages: {
        ...state.messages,
        [convId]: [...existingMessages, message]
      }
    };
  }),

  updateLastMessage: (convId, text, timestamp) => set((state) => ({
    conversations: state.conversations.map(c => 
      c.id === convId ? { ...c, lastMessage: text, lastTimestamp: timestamp } : c
    )
  }))
}));
