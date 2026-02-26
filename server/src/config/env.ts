import dotenv from 'dotenv'

dotenv.config()

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3001',
}
