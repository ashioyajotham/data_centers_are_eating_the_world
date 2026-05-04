import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

/**
 * If Authorization Bearer JWT is valid, sets req.adminAuth = true so read routes
 * can return unpublished rows (e.g. verified = false). Public clients omit the header.
 */
export function optionalAdmin(req: Request, res: Response, next: NextFunction) {
  req.adminAuth = false
  const secret = process.env.JWT_SECRET
  if (!secret) return next()

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return next()

  try {
    jwt.verify(header.slice(7), secret)
    req.adminAuth = true
  } catch {
    /* treat as anonymous */
  }
  next()
}
