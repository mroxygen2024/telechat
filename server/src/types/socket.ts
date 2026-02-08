import type { MessageDTO } from './api.js'

export interface TypingPayload {
  conversationId: string
  senderId: string
}

export interface MessageReadPayload {
  conversationId: string
  readerId: string
  messageIds?: string[]
}

export interface PresencePayload {
  userId: string
  status: 'online' | 'offline'
}

export interface ClientToServerEvents {
  send_message: (payload: MessageDTO) => void
  typing_start: (payload: TypingPayload) => void
  typing_stop: (payload: TypingPayload) => void
  message_read: (payload: MessageReadPayload) => void
  mark_as_read: (payload: MessageReadPayload) => void
}

export interface ServerToClientEvents {
  new_message: (payload: MessageDTO) => void
  message_received: (payload: MessageDTO) => void
  typing_start: (payload: TypingPayload) => void
  typing_stop: (payload: TypingPayload) => void
  message_read: (payload: MessageReadPayload) => void
  presence_update: (payload: PresencePayload) => void
  message_deleted_globally: (payload: { messageId: string; conversationId: string }) => void
}
