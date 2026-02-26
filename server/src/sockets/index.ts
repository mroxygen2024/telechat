import { Server } from 'socket.io'
import type { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket.js'
import {
  messagePayloadSchema,
  messageReadPayloadSchema,
  typingPayloadSchema,
} from '../validators/messageValidators.js'
import { createMessageInConversation } from '../services/messageService.js'
import { Conversation } from '../models/Conversation.js'
import { Message } from '../models/Message.js'
import mongoose from 'mongoose'

// Temporary placeholder for handleMessageRead
const handleMessageRead = () => {
  // TODO: Implement message read logic
};

interface JwtPayload {
  userId: string;
}

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null
const userConnections = new Map<string, number>()

const getRelevantParticipants = async (userId: string) => {
  const conversations = await Conversation.find({ participants: userId })
    .select('participants')
    .lean()

  const participantIds = new Set<string>()
  conversations.forEach((conversation: any) => {
    conversation.participants.forEach((participantId: any) => {
      const participant = participantId.toString()
      if (participant !== userId) {
        participantIds.add(participant)
      }
    })
  })

  return Array.from(participantIds)
}

export const initSocket = (httpServer: HttpServer) => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: env.clientOrigin,
      credentials: true,
    },
  })

  io.use((socket: any, next: any) => {
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

  io.on('connection', (socket: any) => {
    const currentUserId = socket.data.userId as string
    const existingConnections = userConnections.get(currentUserId) || 0
    userConnections.set(currentUserId, existingConnections + 1)

    Conversation.find({ participants: currentUserId })
      .select('_id')
      .lean()
      .then(async (conversations: any[]) => {
        const conversationIds = conversations.map((conversation: any) => conversation._id)
        if (conversationIds.length === 0) return

        const readerObjectId = new mongoose.Types.ObjectId(currentUserId)
        const unreadMessages = await Message.find({
          conversationId: { $in: conversationIds },
          readBy: { $ne: readerObjectId },
          deletedFor: { $ne: readerObjectId },
          isDeletedGlobally: false,
        })
          .sort({ timestamp: 1 })
          .limit(100)
          .lean()

        if (unreadMessages.length > 0) {
          io?.to(currentUserId).emit('missed_messages', {
            messages: unreadMessages.map(serializeMessage),
          })
        }
      })
      .catch(() => {})

    if (existingConnections === 0) {
      getRelevantParticipants(currentUserId)
        .then((participantIds: string[]) => {
          participantIds.forEach((participantId: string) => {
            io?.to(participantId).emit('presence_update', {
              userId: currentUserId,
              status: 'online',
            })
          })
        })
        .catch(() => {})
    }

    getRelevantParticipants(currentUserId)
      .then((participantIds: string[]) => {
        participantIds.forEach((participantId: string) => {
          if ((userConnections.get(participantId) || 0) > 0) {
            io?.to(currentUserId).emit('presence_update', {
              userId: participantId,
              status: 'online',
            })
          }
        })
      })
      .catch(() => {})

    socket.on('send_message', async (payload: any) => {
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

      const serialized = serializeMessage(message)

      if (otherParticipantId) {
        io?.to(otherParticipantId).emit('new_message', serialized)
      }
      return
    })

    // You may need to implement or import handleMessageRead
    // import { handleMessageRead } from '../services/messageService.js' or define it here
    socket.on('message_read', handleMessageRead)
    socket.on('mark_as_read', handleMessageRead)

    socket.on('disconnect', () => {
      const currentCount = userConnections.get(currentUserId) || 0
      if (currentCount <= 1) {
        userConnections.delete(currentUserId)
        getRelevantParticipants(currentUserId)
          .then((participantIds) => {
            participantIds.forEach((participantId) => {
              io?.to(participantId).emit('presence_update', {
                userId: currentUserId,
                status: 'offline',
              })
            })
          })
          .catch(() => {})
      } else {
        userConnections.set(currentUserId, currentCount - 1)
      }
    })

    socket.on('typing_start', async (payload: any) => {
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

    socket.on('typing_stop', async (payload: any) => {
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

  // Move serializeMessage outside io.use

  return io
}

const serializeMessage = (message: {
  _id: mongoose.Types.ObjectId
  conversationId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  content: string
  timestamp: Date
  readBy?: mongoose.Types.ObjectId[]
  deletedFor?: mongoose.Types.ObjectId[]
  isDeletedGlobally?: boolean
}) => ({
  _id: message._id.toString(),
  conversationId: message.conversationId.toString(),
  senderId: message.senderId.toString(),
  content: message.content,
  timestamp: message.timestamp,
  readBy: (message.readBy || []).map((id) => id.toString()),
  deletedFor: (message.deletedFor || []).map((id) => id.toString()),
  isDeletedGlobally: message.isDeletedGlobally ?? false,
})

export const getIO = () => io;