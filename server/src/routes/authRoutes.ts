import { Router } from 'express'
import { login } from '../controllers/authController.js'
import { validate } from '../middleware/validate.js'
import { loginSchema } from '../validators/authValidators.js'

export const authRoutes = Router()

authRoutes.post('/login', validate(loginSchema), login)
