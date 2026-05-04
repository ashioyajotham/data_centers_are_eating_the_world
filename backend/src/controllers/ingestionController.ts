import { Request, Response } from 'express'
import { IngestionCandidateModel } from '../models/IngestionCandidate'
import type { IngestionStatus } from '../models/IngestionCandidate'

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
