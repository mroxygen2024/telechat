import type { RequestHandler } from 'express'
import { Conversation } from '../models/Conversation.js'
import { Message } from '../models/Message.js'
import { User } from '../models/User.js'

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
        readBy: (message.readBy || []).map((id) => id.toString()),
        deletedFor: (message.deletedFor || []).map((id) => id.toString()),
        isDeletedGlobally: message.isDeletedGlobally,
      }))
    )
  } catch (error) {
    next(error)
  }
}

export const createConversation: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string
    const { participantId } = req.body

    if (participantId === userId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' })
    }

    const participant = await User.findById(participantId)
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' })
    }

    const existing = await Conversation.findOne({ participants: { $all: [userId, participantId] } })
      .populate('participants', '_id username')
      .lean()

    if (existing) {
      return res.status(200).json({
        ...existing,
        _id: existing._id.toString(),
        participants: (existing.participants || []).map((p) => ({
          _id: p._id.toString(),
          username: (p as unknown as { _id: any; username: string }).username,
        })),
      })
    }

    const conversation = await Conversation.create({
      participants: [userId, participantId],
    })

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', '_id username')
      .lean()

    if (!populated) {
      return res.status(500).json({ message: 'Failed to create conversation' })
    }

    return res.status(201).json({
      ...populated,
      _id: populated._id.toString(),
      participants: (populated.participants || []).map((p) => ({
        _id: p._id.toString(),
        username: (p as unknown as { _id: any; username: string }).username,
      })),
    })
  } catch (error) {
    next(error)
  }
}
