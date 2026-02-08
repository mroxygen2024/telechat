import mongoose from 'mongoose'
import { Conversation } from '../models/Conversation.js'
import { Message } from '../models/Message.js'

export const createMessageInConversation = async ({
  conversationId,
  senderId,
  content,
}: {
  conversationId: string
  senderId: string
  content: string
}) => {
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) {
    return { message: null, otherParticipantId: null, error: 'Conversation not found' }
  }

  const senderObjectId = new mongoose.Types.ObjectId(senderId)
  const isParticipant = conversation.participants.some(
    (participantId) => participantId.toString() === senderId
  )

  if (!isParticipant) {
    return { message: null, otherParticipantId: null, error: 'Forbidden' }
  }

  const otherParticipant = conversation.participants.find(
    (participantId) => participantId.toString() !== senderId
  )

  const message = await Message.create({
    conversationId,
    senderId: senderObjectId,
    content,
  })

  if (otherParticipant) {
    const currentUnread = conversation.unreadCount.get(otherParticipant.toString()) || 0
    conversation.unreadCount.set(otherParticipant.toString(), currentUnread + 1)
    await conversation.save()
  }

  return {
    message,
    otherParticipantId: otherParticipant?.toString() || null,
    error: null,
  }
}
