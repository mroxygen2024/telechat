import { Router } from 'express'
import { createMessage, deleteMessage, updateMessage } from '../controllers/messageController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validate.js'
import {
	createMessageSchema,
	messageIdParamSchema,
	updateMessageSchema,
} from '../validators/messageValidators.js'

export const messageRoutes = Router()

messageRoutes.post('/', requireAuth, validate(createMessageSchema), createMessage)
messageRoutes.delete('/:id', requireAuth, validate(messageIdParamSchema, 'params'), deleteMessage)
messageRoutes.patch(
	'/:id',
	requireAuth,
	validate(messageIdParamSchema, 'params'),
	validate(updateMessageSchema),
	updateMessage
)
