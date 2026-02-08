import type { RequestHandler } from 'express'
import { Conversation } from '../models/Conversation.js'
import { Message } from '../models/Message.js'

export const getConversations: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', '_id username')
      .lean()

    return res.json(
      conversations.map((conversation) => ({
        ...conversation,
        _id: conversation._id.toString(),
        participants: (conversation.participants || []).map((participant) => ({
          _id: participant._id.toString(),
          username: (participant as unknown as { _id: any; username: string }).username,
        })),
      }))
    )
  } catch (error) {
    next(error)
  }
}

export const getMessages: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string
    const { id } = req.params

    const conversation = await Conversation.findById(id)
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    const isParticipant = conversation.participants.some(
      (participantId) => participantId.toString() === userId
    )

    if (!isParticipant) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const messages = await Message.find({ conversationId: id }).sort({ timestamp: 1 }).lean()

    return res.json(
      messages.map((message) => ({
        ...message,
        _id: message._id.toString(),
        conversationId: message.conversationId.toString(),
        senderId: message.senderId.toString(),
      }))
    )
  } catch (error) {
    next(error)
  }
}
