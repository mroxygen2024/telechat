import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket.js'
import { messagePayloadSchema, typingPayloadSchema } from '../validators/messageValidators.js'
import { createMessageInConversation } from '../services/messageService.js'
import { Conversation } from '../models/Conversation.js'

interface JwtPayload {
  userId: string
}

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null

export const initSocket = (httpServer: HttpServer) => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: env.clientOrigin,
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined
    if (!token) {
      return next(new Error('Unauthorized'))
    }

    try {
      const payload = jwt.verify(token, env.jwtSecret) as JwtPayload
      socket.data.userId = payload.userId
      socket.join(payload.userId)
      next()
    } catch {
      next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    socket.on('send_message', async (payload) => {
      const parsed = messagePayloadSchema.safeParse(payload)
      if (!parsed.success) {
        return
      }

      if (parsed.data.senderId !== socket.data.userId) {
        return
      }

      const { message, otherParticipantId } = await createMessageInConversation({
        conversationId: parsed.data.conversationId,
        senderId: parsed.data.senderId,
        content: parsed.data.content,
      })

      if (!message) {
        return
      }

      const serialized = {
        _id: message._id.toString(),
        conversationId: message.conversationId.toString(),
        senderId: message.senderId.toString(),
        content: message.content,
        timestamp: message.timestamp,
      }

      if (otherParticipantId) {
        io?.to(otherParticipantId).emit('new_message', serialized)
      }

      io?.to(socket.data.userId).emit('message_received', serialized)
    })

    socket.on('typing_start', async (payload) => {
      const parsed = typingPayloadSchema.safeParse(payload)
      if (!parsed.success) {
        return
      }

      if (parsed.data.senderId !== socket.data.userId) {
        return
      }

      const conversation = await Conversation.findById(parsed.data.conversationId).lean()
      if (!conversation) {
        return
      }

      const isParticipant = conversation.participants.some(
        (participantId) => participantId.toString() === socket.data.userId
      )

      if (!isParticipant) {
        return
      }

      const otherParticipant = conversation.participants.find(
        (participantId) => participantId.toString() !== socket.data.userId
      )

      if (otherParticipant) {
        io?.to(otherParticipant.toString()).emit('typing_start', {
          conversationId: parsed.data.conversationId,
          senderId: parsed.data.senderId,
        })
      }
    })

    socket.on('typing_stop', async (payload) => {
      const parsed = typingPayloadSchema.safeParse(payload)
      if (!parsed.success) {
        return
      }

      if (parsed.data.senderId !== socket.data.userId) {
        return
      }

      const conversation = await Conversation.findById(parsed.data.conversationId).lean()
      if (!conversation) {
        return
      }

      const isParticipant = conversation.participants.some(
        (participantId) => participantId.toString() === socket.data.userId
      )

      if (!isParticipant) {
        return
      }

      const otherParticipant = conversation.participants.find(
        (participantId) => participantId.toString() !== socket.data.userId
      )

      if (otherParticipant) {
        io?.to(otherParticipant.toString()).emit('typing_stop', {
          conversationId: parsed.data.conversationId,
          senderId: parsed.data.senderId,
        })
      }
    })
  })

  return io
}

export const getIO = () => io
