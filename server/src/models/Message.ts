import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
)

export type MessageDocument = InferSchemaType<typeof messageSchema>

export const Message = mongoose.model<MessageDocument>('Message', messageSchema)
