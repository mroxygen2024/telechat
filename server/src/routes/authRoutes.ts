import { Router } from 'express'
import { login, signup } from '../controllers/authController.js'
import { validate } from '../middleware/validate.js'
import { loginSchema, signupSchema } from '../validators/authValidators.js'

export const authRoutes = Router()

authRoutes.post('/login', validate(loginSchema), login)
authRoutes.post('/signup', validate(signupSchema), signup)
