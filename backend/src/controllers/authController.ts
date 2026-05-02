import { Request, Response } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import { AdminAuthModel } from '../models/AdminAuth'

const MIN_PASSWORD_LENGTH = 12
const BCRYPT_COST = 12

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

function getJwtSecret(): string | null {
  const s = process.env.JWT_SECRET
  return s && s.length > 0 ? s : null
}

function issueAdminToken(): string {
  const secret = getJwtSecret()!
  const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as SignOptions['expiresIn']
  return jwt.sign({ role: 'admin' }, secret, { expiresIn })
}

function parseAllowedGoogleEmails(): string[] {
  const raw = process.env.ADMIN_GOOGLE_EMAILS || ''
  return raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
}

export const status = async (_req: Request, res: Response) => {
  const jwtConfigured = Boolean(getJwtSecret())
  const pwState = await AdminAuthModel.getPasswordState()

  const migrationRequired = pwState.kind === 'table_missing'
  const passwordHash = pwState.kind === 'ok' ? pwState.hash : null

  const needsPasswordSetup = migrationRequired ? true : passwordHash === null
  const legacyEnvLoginAvailable = Boolean(process.env.ADMIN_PASSWORD)
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && parseAllowedGoogleEmails().length > 0
  )
  const setupRequiresToken = Boolean(
    process.env.ADMIN_SETUP_TOKEN && process.env.ADMIN_SETUP_TOKEN.length > 0
  )

  res.json({
    jwtConfigured,
    needsPasswordSetup,
    legacyEnvLoginAvailable,
    googleEnabled,
    setupRequiresToken,
    migrationRequired,
  })
}

/** One-time: store bcrypt hash. Optional ADMIN_SETUP_TOKEN in production. Returns JWT. */
export const setupPassword = async (req: Request, res: Response) => {
  const secret = getJwtSecret()
  if (!secret) {
    return res.status(503).json({ error: 'JWT_SECRET is not configured on the server' })
  }

  const pwState = await AdminAuthModel.getPasswordState()
  if (pwState.kind === 'table_missing') {
    return res.status(503).json({
      error:
        'Database is missing the admin_auth table. Run the SQL from backend/src/db/schema.sql (admin_auth section) on your production database, or run: cd backend && npm run db:setup',
    })
  }
  if (pwState.hash !== null) {
    return res.status(400).json({ error: 'Admin password is already configured' })
  }

  const setupToken = process.env.ADMIN_SETUP_TOKEN
  const { password, passwordConfirm, setupToken: bodyToken } = req.body as {
    password?: string
    passwordConfirm?: string
    setupToken?: string
  }

  if (setupToken && setupToken.length > 0) {
    if (typeof bodyToken !== 'string' || !timingSafeEqualString(bodyToken, setupToken)) {
      return res.status(403).json({ error: 'Invalid setup token' })
    }
  }

  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    })
  }
  if (password !== passwordConfirm) {
    return res.status(400).json({ error: 'Passwords do not match' })
  }

  try {
    const hash = await bcrypt.hash(password, BCRYPT_COST)
    await AdminAuthModel.setPasswordHash(hash)
    res.json({ token: issueAdminToken() })
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === '42P01') {
      return res.status(503).json({
        error:
          'Database is missing the admin_auth table. Apply the schema update (see backend/src/db/schema.sql).',
      })
    }
    throw e
  }
}

export const login = async (req: Request, res: Response) => {
  const secret = getJwtSecret()
  if (!secret) {
    return res.status(503).json({ error: 'JWT_SECRET is not configured on the server' })
  }

  const { password } = req.body as { password?: string }
  if (typeof password !== 'string') {
    return res.status(400).json({ error: 'Password required' })
  }

  const pwState = await AdminAuthModel.getPasswordState()
  if (pwState.kind === 'table_missing') {
    const adminPassword = process.env.ADMIN_PASSWORD
    if (adminPassword && timingSafeEqualString(password, adminPassword)) {
      return res.json({ token: issueAdminToken() })
    }
    return res.status(503).json({
      error:
        'Database is missing the admin_auth table. Run the migration SQL, or set ADMIN_PASSWORD temporarily after creating the table.',
    })
  }

  if (pwState.hash) {
    const ok = await bcrypt.compare(password, pwState.hash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    return res.json({ token: issueAdminToken() })
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminPassword && timingSafeEqualString(password, adminPassword)) {
    return res.json({ token: issueAdminToken() })
  }

  return res.status(401).json({
    error:
      'Invalid credentials. If the database has no admin password yet, use the initial setup form.',
  })
}

/** Google Identity Services credential (ID token). */
export const loginGoogle = async (req: Request, res: Response) => {
  const secret = getJwtSecret()
  if (!secret) {
    return res.status(503).json({ error: 'JWT_SECRET is not configured on the server' })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const allowed = parseAllowedGoogleEmails()
  if (!clientId || allowed.length === 0) {
    return res.status(503).json({ error: 'Google sign-in is not configured on the server' })
  }

  const { credential } = req.body as { credential?: string }
  if (typeof credential !== 'string' || !credential) {
    return res.status(400).json({ error: 'Missing Google credential' })
  }

  try {
    const client = new OAuth2Client(clientId)
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    })
    const email = ticket.getPayload()?.email?.toLowerCase()
    if (!email || !allowed.includes(email)) {
      return res.status(403).json({ error: 'This Google account is not authorized for admin' })
    }
    res.json({ token: issueAdminToken() })
  } catch {
    res.status(401).json({ error: 'Google sign-in verification failed' })
  }
}

export const me = async (req: Request, res: Response) => {
  const secret = getJwtSecret()
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
