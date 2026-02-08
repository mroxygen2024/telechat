import type { MessageDTO } from './api.js'

export interface ClientToServerEvents {
  send_message: (payload: MessageDTO) => void
}

export interface ServerToClientEvents {
  new_message: (payload: MessageDTO) => void
  message_received: (payload: MessageDTO) => void
}
