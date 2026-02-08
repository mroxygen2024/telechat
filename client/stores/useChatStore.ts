
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
  updateMessagesReadBy: (
    convId: string,
    messageIds: string[],
    readerId: string,
    currentUserId?: string
  ) => void;
  updateMessageContent: (convId: string, messageId: string, content: string) => void;
  removeMessage: (convId: string, messageId: string) => void;
  updateLastMessage: (convId: string, text: string, timestamp: string) => void;
  addConversation: (conversation: Conversation) => void;
  setConversationUnreadCount: (convId: string, unreadCount: number) => void;
  updateUserPresence: (userId: string, status: 'online' | 'offline') => void;
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

  updateMessagesReadBy: (convId, messageIds, readerId, currentUserId) =>
    set((state) => {
      const existingMessages = state.messages[convId] || [];
      const messageIdSet = new Set(messageIds);

      return {
        messages: {
          ...state.messages,
          [convId]: existingMessages.map((msg) => {
            if (!messageIdSet.has(msg.id)) return msg;
            const readBy = msg.readBy.includes(readerId)
              ? msg.readBy
              : [...msg.readBy, readerId];
            const shouldMarkRead =
              currentUserId && msg.senderId === currentUserId && readerId !== currentUserId;
            return {
              ...msg,
              readBy,
              status: shouldMarkRead ? 'read' : msg.status,
            };
          }),
        },
      };
    }),

  updateMessageContent: (convId, messageId, content) =>
    set((state) => {
      const existingMessages = state.messages[convId] || [];
      return {
        messages: {
          ...state.messages,
          [convId]: existingMessages.map((msg) =>
            msg.id === messageId ? { ...msg, content } : msg
          ),
        },
      };
    }),

  removeMessage: (convId, messageId) =>
    set((state) => {
      const existingMessages = state.messages[convId] || [];
      return {
        messages: {
          ...state.messages,
          [convId]: existingMessages.filter((msg) => msg.id !== messageId),
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
  }),

  setConversationUnreadCount: (convId, unreadCount) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === convId ? { ...conv, unreadCount } : conv
      ),
    })),

  updateUserPresence: (userId, status) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => ({
        ...conv,
        participants: conv.participants.map((participant) =>
          participant.id === userId ? { ...participant, status } : participant
        ),
      })),
    })),
}));
