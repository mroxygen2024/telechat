import type { RequestHandler } from 'express'
import type { ZodSchema } from 'zod'

export const validate = (schema: ZodSchema, source: 'body' | 'params' = 'body'): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.flatten(),
      })
    }

    req[source] = result.data
    next()
  }
