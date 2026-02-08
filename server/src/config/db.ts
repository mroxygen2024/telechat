import mongoose from 'mongoose'
import { env } from './env.js'

export const connectDb = async (): Promise<void> => {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI is not set')
  }

  await mongoose.connect(env.mongoUri)
}
