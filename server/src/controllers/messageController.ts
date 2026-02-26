import type { RequestHandler } from 'express'
import { createMessageInConversation } from '../services/messageService.js'
import { getIO } from '../sockets/index.js'
import { Message } from '../models/Message.js'
import { Conversation } from '../models/Conversation.js'
import mongoose from 'mongoose'

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
      deletedFor: (message.deletedFor || []).map((id) => id.toString()),
      isDeletedGlobally: message.isDeletedGlobally ?? false,
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

export const deleteMessage: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string
    const { id } = req.params
    const { deleteType } = req.body as { deleteType: 'me' | 'everyone' }

    const message = await Message.findById(id)
    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    if (deleteType === 'everyone') {
      if (message.senderId.toString() !== userId) {
        return res.status(403).json({ message: 'Forbidden' })
      }

      if (!message.isDeletedGlobally) {
        message.isDeletedGlobally = true
        await message.save()
      }

      const io = getIO()
      if (io) {
        const conversation = await Conversation.findById(message.conversationId).lean()
        if (conversation) {
          conversation.participants.forEach((participantId) => {
            io.to(participantId.toString()).emit('message_deleted_globally', {
              messageId: message._id.toString(),
              conversationId: message.conversationId.toString(),
            })
          })
        }
      }

      return res.json({
        _id: id,
        conversationId: message.conversationId.toString(),
        deleteType,
      })
    }

    if (!message.deletedFor.some((id) => id.toString() === userId)) {
      message.deletedFor.push(new mongoose.Types.ObjectId(userId))
      await message.save()
    }

    return res.json({
      _id: id,
      conversationId: message.conversationId.toString(),
      deleteType,
    })
  } catch (error) {
    next(error)
  }
}

export const updateMessage: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string
    const { id } = req.params
    const { content } = req.body

    const message = await Message.findById(id)
    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    if (message.isDeletedGlobally) {
      return res.status(400).json({ message: 'Message was deleted' })
    }

    message.content = content
    await message.save()

    const serialized = {
      _id: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: message.senderId.toString(),
      content: message.content,
      timestamp: message.timestamp,
      readBy: (message.readBy || []).map((id) => id.toString()),
        deletedFor: (message.deletedFor || []).map((id) => id.toString()),
        isDeletedGlobally: message.isDeletedGlobally ?? false,
    }

    return res.json(serialized)
  } catch (error) {
    next(error)
  }
}
