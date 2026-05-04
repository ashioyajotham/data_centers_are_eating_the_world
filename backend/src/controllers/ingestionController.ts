import { Request, Response } from 'express'
import { IngestionCandidateModel } from '../models/IngestionCandidate'
import type { IngestionStatus } from '../models/IngestionCandidate'
import { notifyAdminsNewPublicSubmission } from '../services/submissionNotify'

const ALLOWED_STATUS = new Set([
  'operational',
  'planned',
  'under-construction',
  'decommissioned',
])
const ALLOWED_OWNERSHIP = new Set(['local', 'foreign', 'joint-venture'])

type PublicSubmissionInput = Parameters<typeof IngestionCandidateModel.createFromPublicSubmission>[0]

function parsePublicSuggestion(body: unknown): { error: string } | { ok: PublicSubmissionInput } {
  if (!body || typeof body !== 'object') return { error: 'Invalid body' }
  const b = body as Record<string, unknown>

  const str = (k: string, min = 1, max = 500): string | null => {
    const v = b[k]
    if (typeof v !== 'string') return null
    const t = v.trim()
    if (t.length < min || t.length > max) return null
    return t
  }

  const name = str('name', 2, 255)
  const operator = str('operator', 2, 255)
  const address = str('address', 2, 500)
  const city = str('city', 2, 100)
  if (!name || !operator || !address || !city) {
    return { error: 'name, operator, address, and city are required (text).' }
  }

  const country = str('country', 2, 100) || 'Kenya'

  const lat = Number(b.latitude)
  const lon = Number(b.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { error: 'latitude and longitude must be numbers (e.g. from Google Maps).' }
  }

  const st = typeof b.status === 'string' ? b.status.trim() : ''
  if (!ALLOWED_STATUS.has(st)) return { error: 'Invalid status.' }
  const ow =
    typeof b.ownershipType === 'string'
      ? b.ownershipType.trim()
      : typeof b.ownership_type === 'string'
        ? b.ownership_type.trim()
        : ''
  if (!ALLOWED_OWNERSHIP.has(ow)) return { error: 'Invalid ownership type.' }

  const sourceUrlRaw = typeof b.sourceUrl === 'string' ? b.sourceUrl.trim() : ''
  if (!sourceUrlRaw)
    return { error: 'A reference URL (news, company site, etc.) is required.' }
  try {
    const u = new URL(sourceUrlRaw)
    if (u.protocol !== 'http:' && u.protocol !== 'https:')
      return { error: 'Reference URL must be http(s).' }
  } catch {
    return { error: 'Reference URL is not valid.' }
  }

  let yearEstablished: number | null = null
  if (b.yearEstablished !== undefined && b.yearEstablished !== null && b.yearEstablished !== '') {
    const y = Number(b.yearEstablished)
    if (!Number.isInteger(y) || y < 1960 || y > 2100)
      return { error: 'yearEstablished must be a plausible year.' }
    yearEstablished = y
  }

  let powerMw: number | null = null
  if (b.powerMw !== undefined && b.powerMw !== null && b.powerMw !== '') {
    const p = Number(b.powerMw)
    if (!Number.isFinite(p) || p < 0 || p > 10000)
      return { error: 'powerMw must be a non-negative number.' }
    powerMw = p
  }

  let notes: string | undefined
  if (typeof b.notes === 'string') {
    const n = b.notes.trim()
    if (n.length > 2000) return { error: 'Notes too long (max 2000 characters).' }
    notes = n || undefined
  }

  const submitterEmail =
    typeof b.submitterEmail === 'string' && b.submitterEmail.includes('@')
      ? b.submitterEmail.trim().slice(0, 320)
      : undefined
  const sourceName =
    typeof b.sourceName === 'string' ? b.sourceName.trim().slice(0, 255) : undefined
  const submitterName =
    typeof b.submitterName === 'string' ? b.submitterName.trim().slice(0, 200) : undefined

  return {
    ok: {
      name,
      operator,
      address,
      city,
      country,
      latitude: lat,
      longitude: lon,
      status: st,
      ownership_type: ow,
      sourceUrl: sourceUrlRaw,
      sourceName,
      year_established: yearEstablished,
      power_mw: powerMw,
      submitterEmail,
      submitterName,
      notes,
    },
  }
}

/** Tier E: public suggestion → ingestion_candidates; optional Resend email to admins. */
export const suggestPublic = async (req: Request, res: Response) => {
  try {
    const trap = (req.body as { website?: string })?.website
    if (typeof trap === 'string' && trap.trim() !== '') {
      return res.status(201).json({ ok: true, message: 'Thank you.' })
    }

    const parsed = parsePublicSuggestion(req.body)
    if ('error' in parsed) return res.status(400).json({ error: parsed.error })

    const p = parsed.ok
    const row = await IngestionCandidateModel.createFromPublicSubmission(p)

    const summary = [
      `Name: ${p.name}`,
      `Operator: ${p.operator}`,
      `Location: ${p.city}, ${p.country}`,
      `Status: ${p.status}`,
      p.submitterEmail ? `Submitter: ${p.submitterEmail}` : 'Submitter: (not provided)',
      p.notes ? `Notes: ${p.notes}` : '',
    ].filter(Boolean)

    await notifyAdminsNewPublicSubmission(row.id, summary)

    res.status(201).json({
      id: row.id,
      message: 'Thank you. Your suggestion is pending admin review before it appears on the map.',
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Could not save suggestion.' })
  }
}

export const listCandidates = async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as IngestionStatus | undefined) || 'pending'
    if (!['pending', 'approved', 'rejected', 'duplicate'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' })
    }
    const rows = await IngestionCandidateModel.listByStatus(status)
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to list candidates' })
  }
}

export const approveCandidate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { note } = req.body as { note?: string }
    const result = await IngestionCandidateModel.approve(id, note)
    res.json(result)
  } catch (e: any) {
    const msg = e?.message || 'Approve failed'
    if (msg.includes('not found') || msg.includes('Only pending')) {
      return res.status(400).json({ error: msg })
    }
    console.error(e)
    res.status(500).json({ error: msg })
  }
}

export const rejectCandidate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { note } = req.body as { note?: string }
    const row = await IngestionCandidateModel.reject(id, note)
    if (!row) return res.status(404).json({ error: 'Candidate not found' })
    res.json(row)
  } catch (e: any) {
    const msg = e?.message || 'Reject failed'
    if (msg.includes('Only pending')) {
      return res.status(400).json({ error: msg })
    }
    console.error(e)
    res.status(500).json({ error: msg })
  }
}

export const duplicateCandidate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { existingDataCenterId, note } = req.body as {
      existingDataCenterId?: string
      note?: string
    }
    if (!existingDataCenterId || typeof existingDataCenterId !== 'string') {
      return res.status(400).json({ error: 'existingDataCenterId required' })
    }
    const row = await IngestionCandidateModel.markDuplicate(id, existingDataCenterId, note)
    if (!row) return res.status(404).json({ error: 'Candidate not found' })
    res.json(row)
  } catch (e: any) {
    const msg = e?.message || 'Update failed'
    if (msg.includes('Only pending')) {
      return res.status(400).json({ error: msg })
    }
    console.error(e)
    res.status(500).json({ error: msg })
  }
}
