import { Request, Response } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import crypto from 'crypto'

function timingSafeEqualString(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'utf8')
    const bb = Buffer.from(b, 'utf8')
    if (ba.length !== bb.length) return false
    return crypto.timingSafeEqual(ba, bb)
  } catch {
    return false
  }
}

export const login = async (req: Request, res: Response) => {
  const adminPassword = process.env.ADMIN_PASSWORD
  const secret = process.env.JWT_SECRET

  if (!adminPassword || !secret) {
    return res
      .status(503)
      .json({ error: 'Admin authentication is not configured on the server' })
  }

  const { password } = req.body as { password?: string }
  if (typeof password !== 'string' || !timingSafeEqualString(password, adminPassword)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as SignOptions['expiresIn']
  const signOptions: SignOptions = { expiresIn }
  const token = jwt.sign({ role: 'admin' }, secret, signOptions)
  res.json({ token })
}

/** Validates Bearer JWT; used by the admin SPA to restore sessions. */
export const me = async (req: Request, res: Response) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res
      .status(503)
      .json({ error: 'Admin authentication is not configured on the server' })
  }

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    jwt.verify(header.slice(7), secret)
    res.json({ ok: true as const })
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
