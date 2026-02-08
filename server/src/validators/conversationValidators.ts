import { z } from 'zod'
import { objectIdSchema } from './common.js'

export const conversationIdParamSchema = z.object({
  id: objectIdSchema,
})
