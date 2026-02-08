import mongoose, { Schema, type InferSchemaType, type Types } from 'mongoose'

const conversationSchema = new Schema(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
      validate: {
        validator: (value: Types.ObjectId[]) => value.length === 2,
        message: 'Conversation must have exactly 2 participants',
      },
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
)

export type ConversationDocument = InferSchemaType<typeof conversationSchema>

export const Conversation = mongoose.model<ConversationDocument>(
  'Conversation',
  conversationSchema
)
