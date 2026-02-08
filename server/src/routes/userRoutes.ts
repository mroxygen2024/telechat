import { Router } from 'express'
import { listUsers } from '../controllers/userController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

export const userRoutes = Router()

userRoutes.get('/', requireAuth, listUsers)
