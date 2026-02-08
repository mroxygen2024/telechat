import type { RequestHandler } from 'express'
import { User } from '../models/User.js'

export const listUsers: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId as string
    const search = String(req.query.search || '').trim()

    const filter: Record<string, any> = { _id: { $ne: userId } }
    if (search) {
      filter.username = { $regex: search, $options: 'i' }
    }

    const users = await User.find(filter).select('_id username').sort({ username: 1 }).lean()

    return res.json(
      users.map((user) => ({
        _id: user._id.toString(),
        username: user.username,
      }))
    )
  } catch (error) {
    next(error)
  }
}
