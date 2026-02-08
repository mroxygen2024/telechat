import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

interface JwtPayload {
  userId: string
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = header.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
