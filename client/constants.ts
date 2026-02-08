
import { User, Conversation, Message } from './types';

export const DUMMY_ME: User = {
  id: 'me-123',
  username: 'John Doe',
  avatar: 'https://picsum.photos/seed/me/100/100',
  status: 'online'
};

export const DUMMY_USERS: User[] = [
  { id: 'user-1', username: 'Alice Smith', avatar: 'https://picsum.photos/seed/alice/100/100', status: 'online' },
  { id: 'user-2', username: 'Bob Johnson', avatar: 'https://picsum.photos/seed/bob/100/100', status: 'offline' },
  { id: 'user-3', username: 'Charlie Davis', avatar: 'https://picsum.photos/seed/charlie/100/100', status: 'online' },
  { id: 'user-4', username: 'Diana Prince', avatar: 'https://picsum.photos/seed/diana/100/100', status: 'offline' },
];

export const DUMMY_CONVERSATIONS: Conversation[] = DUMMY_USERS.map((user, idx) => ({
  id: `conv-${idx + 1}`,
  participants: [DUMMY_ME, user],
  lastMessage: idx === 0 ? 'See you later!' : 'Hey, how is it going?',
  lastTimestamp: new Date(Date.now() - idx * 3600000).toISOString(),
  unreadCount: idx === 1 ? 2 : 0,
}));

export const DUMMY_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    { id: 'm1', conversationId: 'conv-1', senderId: 'user-1', content: 'Hello John!', timestamp: new Date(Date.now() - 7200000).toISOString(), readBy: ['user-1', 'me-123'], status: 'read' },
    { id: 'm2', conversationId: 'conv-1', senderId: 'me-123', content: 'Hi Alice, how are you?', timestamp: new Date(Date.now() - 7100000).toISOString(), readBy: ['me-123', 'user-1'], status: 'read' },
    { id: 'm3', conversationId: 'conv-1', senderId: 'user-1', content: 'I am doing great! Are we still on for lunch?', timestamp: new Date(Date.now() - 7000000).toISOString(), readBy: ['user-1', 'me-123'], status: 'read' },
    { id: 'm4', conversationId: 'conv-1', senderId: 'me-123', content: 'Yes, definitely. See you later!', timestamp: new Date(Date.now() - 6900000).toISOString(), readBy: ['me-123', 'user-1'], status: 'read' },
  ],
  'conv-2': [
    { id: 'm5', conversationId: 'conv-2', senderId: 'user-2', content: 'Did you see the new update?', timestamp: new Date(Date.now() - 3600000).toISOString(), readBy: ['user-2'], status: 'delivered' },
  ]
};
