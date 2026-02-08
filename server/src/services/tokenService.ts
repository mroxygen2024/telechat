import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const signToken = (userId: string): string => {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' })
}
