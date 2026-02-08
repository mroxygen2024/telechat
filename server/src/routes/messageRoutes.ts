import { Router } from 'express'
import { createMessage } from '../controllers/messageController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
import { createMessageSchema } from '../validators/messageValidators.js'

export const messageRoutes = Router()

messageRoutes.post('/', requireAuth, validate(createMessageSchema), createMessage)
