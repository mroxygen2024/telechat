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

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const { username, password } = req.body

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' })
    }

    const user = await User.create({ username, password })
    const token = signToken(user._id.toString())

    return res.status(201).json({
      user: {
        _id: user._id.toString(),
        username: user.username,
      },
      token,
    })
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Username already exists' })
    }
    next(error)
  }
}
