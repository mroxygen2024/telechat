
import { create } from 'zustand';
import { Conversation, Message } from '../types';

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  
  setConversations: (convs: Conversation[]) => void;
  setMessages: (convId: string, messages: Message[]) => void;
  setLoading: (isLoading: boolean) => void;
  setActiveConversation: (id: string | null) => void;
  upsertMessage: (convId: string, message: Message) => void;
  updateMessageStatus: (convId: string, messageId: string, status: Message['status']) => void;
  updateLastMessage: (convId: string, text: string, timestamp: string) => void;
  addConversation: (conversation: Conversation) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),

  setMessages: (convId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [convId]: messages,
      },
    })),

  setLoading: (isLoading) => set({ isLoading }),
  
  setActiveConversation: (id) => set({ activeConversationId: id }),
  
  upsertMessage: (convId, message) =>
    set((state) => {
      const existingMessages = state.messages[convId] || [];
      const existingIndex = existingMessages.findIndex((msg) => msg.id === message.id);

      const updatedMessages = [...existingMessages];
      if (existingIndex >= 0) {
        updatedMessages[existingIndex] = message;
      } else {
        updatedMessages.push(message);
      }

      return {
        messages: {
          ...state.messages,
          [convId]: updatedMessages,
        },
      };
    }),

  updateMessageStatus: (convId, messageId, status) =>
    set((state) => {
      const existingMessages = state.messages[convId] || [];
      return {
        messages: {
          ...state.messages,
          [convId]: existingMessages.map((msg) =>
            msg.id === messageId ? { ...msg, status } : msg
          ),
        },
      };
    }),

  updateLastMessage: (convId, text, timestamp) => set((state) => ({
    conversations: state.conversations.map(c => 
      c.id === convId ? { ...c, lastMessage: text, lastTimestamp: timestamp } : c
    )
  })),

  addConversation: (conversation) => set((state) => {
    const exists = state.conversations.some((c) => c.id === conversation.id)
    return {
      conversations: exists ? state.conversations : [conversation, ...state.conversations],
    }
  })
}));
