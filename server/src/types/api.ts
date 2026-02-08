export interface AuthLoginRequest {
  username: string
  password: string
}

export interface AuthLoginResponse {
  user: UserDTO
  token: string
}

export interface UserDTO {
  _id: string
  username: string
}

export interface ConversationDTO {
  _id: string
  participants: UserDTO[] | string[]
  unreadCount: Record<string, number>
}

export interface MessageDTO {
  _id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string | Date
  readBy?: string[]
  deletedFor?: string[]
  isDeletedGlobally?: boolean
}

export interface CreateMessageRequest {
  conversationId: string
  content: string
}
