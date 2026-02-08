import { Router } from 'express'
import { getConversations, getMessages } from '../controllers/conversationController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
import { conversationIdParamSchema } from '../validators/conversationValidators.js'

export const conversationRoutes = Router()

conversationRoutes.get('/', requireAuth, getConversations)
conversationRoutes.get('/:id/messages', requireAuth, validate(conversationIdParamSchema, 'params'), getMessages)
