import type { RequestHandler } from 'express'
import { User } from '../models/User.js'
import { signToken } from '../services/tokenService.js'

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signToken(user._id.toString())

    return res.json({
      user: {
        _id: user._id.toString(),
        username: user.username,
      },
      token,
    })
  } catch (error) {
    next(error)
  }
}
