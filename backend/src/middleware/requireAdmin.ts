import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

/** Requires Authorization: Bearer <JWT> signed with JWT_SECRET. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(503).json({ error: 'Admin authentication is not configured on the server' })
  }

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    jwt.verify(header.slice(7), secret)
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
