import type { RequestHandler } from 'express'
import { createMessageInConversation } from '../services/messageService.js'
import { getIO } from '../sockets/index.js'

export const createMessage: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string
    const { conversationId, content } = req.body

    const { message, otherParticipantId, error } = await createMessageInConversation({
      conversationId,
      senderId: userId,
      content,
    })

    if (!message) {
      if (error === 'Conversation not found') {
        return res.status(404).json({ message: error })
      }

      if (error === 'Forbidden') {
        return res.status(403).json({ message: error })
      }

      return res.status(400).json({ message: 'Unable to send message' })
    }

    const serialized = {
      _id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      content: message.content,
      timestamp: message.timestamp,
      readBy: (message.readBy || []).map((id) => id.toString()),
    }

    const io = getIO()
    if (io) {
      if (otherParticipantId) {
        io.to(otherParticipantId).emit('new_message', serialized)
      }
      io.to(userId).emit('message_received', serialized)
    }

    return res.status(201).json(serialized)
  } catch (error) {
    next(error)
  }
}
