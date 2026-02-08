import { z } from 'zod'
import { objectIdSchema } from './common.js'

export const createMessageSchema = z.object({
  conversationId: objectIdSchema,
  content: z.string().min(1),
})

export const messageIdParamSchema = z.object({
  id: objectIdSchema,
})

export const updateMessageSchema = z.object({
  content: z.string().min(1),
})

export const messagePayloadSchema = z.object({
  _id: z.string().optional(),
  conversationId: objectIdSchema,
  senderId: objectIdSchema,
  content: z.string().min(1),
  timestamp: z.union([z.string(), z.date()]).optional(),
  readBy: z.array(objectIdSchema).optional(),
})

export const typingPayloadSchema = z.object({
  conversationId: objectIdSchema,
  senderId: objectIdSchema,
})

export const messageReadPayloadSchema = z.object({
  conversationId: objectIdSchema,
  readerId: objectIdSchema,
  messageIds: z.array(objectIdSchema).optional(),
})
