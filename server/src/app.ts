import express from 'express'
import cors from 'cors'
import { authRoutes } from './routes/authRoutes.js'
import { conversationRoutes } from './routes/conversationRoutes.js'
import { messageRoutes } from './routes/messageRoutes.js'
import { errorHandler } from './middleware/errorMiddleware.js'
import { env } from './config/env.js'
import morgan from 'morgan'

export const createApp = () => {
  const app = express()
  app.use(morgan('dev'))

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    })
  )
  app.use(express.json())

  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/auth', authRoutes)
  app.use('/conversations', conversationRoutes)
  app.use('/messages', messageRoutes)

  app.use(errorHandler)

  return app
}
