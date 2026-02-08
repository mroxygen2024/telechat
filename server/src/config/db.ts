import mongoose from 'mongoose'
import { env } from './env.js'

export const connectDb = async (): Promise<void> => {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is not set')
  }

  try {
    await mongoose.connect(env.mongoUri)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection failed', error)
    throw error
  }
}
