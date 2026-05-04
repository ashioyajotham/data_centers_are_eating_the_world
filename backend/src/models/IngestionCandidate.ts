import { query } from '../db/connection'
import { DataCenterModel, type DataCenter } from './DataCenter'

export type IngestionStatus = 'pending' | 'approved' | 'rejected' | 'duplicate'

export interface IngestionCandidate {
  id: string
  status: IngestionStatus
  sourceSystem: string
  externalId: string
  countryScope: string
  candidatePayload: Record<string, unknown>
  rawPayload: Record<string, unknown> | null
  sourceUrls: string[]
  confidence: number
  mergedDataCenterId: string | null
  resolutionNote: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

export class IngestionCandidateModel {
  private static mapRow(row: any): IngestionCandidate {
    return {
      id: row.id,
      status: row.status,
      sourceSystem: row.source_system,
      externalId: row.external_id,
      countryScope: row.country_scope,
      candidatePayload: row.candidate_payload,
      rawPayload: row.raw_payload,
      sourceUrls: row.source_urls || [],
      confidence: row.confidence,
      mergedDataCenterId: row.merged_data_center_id,
      resolutionNote: row.resolution_note,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      resolvedAt: row.resolved_at,
    }
  }

  static async listByStatus(status: IngestionStatus = 'pending'): Promise<IngestionCandidate[]> {
    const result = await query(
      `
      SELECT * FROM ingestion_candidates
      WHERE status = $1
      ORDER BY created_at DESC
    `,
      [status]
    )
    return result.rows.map(this.mapRow)
  }

  static async findById(id: string): Promise<IngestionCandidate | null> {
    const result = await query(`SELECT * FROM ingestion_candidates WHERE id = $1`, [id])
    if (result.rows.length === 0) return null
    return this.mapRow(result.rows[0])
  }

  static async approve(id: string, note?: string): Promise<{ candidate: IngestionCandidate; dataCenter: DataCenter }> {
    const c = await this.findById(id)
    if (!c) throw new Error('Candidate not found')
    if (c.status !== 'pending') {
      throw new Error('Only pending candidates can be approved')
    }

    const dc = await DataCenterModel.upsertFromIngestionPayload(c.candidatePayload)

    await query(
      `
      UPDATE ingestion_candidates SET
        status = 'approved',
        merged_data_center_id = $2,
        resolution_note = COALESCE($3, resolution_note),
        resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
      [id, dc.id, note ?? null]
    )

    const updated = await this.findById(id)
    if (!updated) throw new Error('Candidate missing after approve')
    return { candidate: updated, dataCenter: dc }
  }

  static async reject(id: string, note?: string): Promise<IngestionCandidate | null> {
    const c = await this.findById(id)
    if (!c) return null
    if (c.status !== 'pending') {
      throw new Error('Only pending candidates can be rejected')
    }

    await query(
      `
      UPDATE ingestion_candidates SET
        status = 'rejected',
        resolution_note = $2,
        resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
      [id, note ?? 'Rejected by admin']
    )

    return this.findById(id)
  }

  static async markDuplicate(id: string, existingDataCenterId: string, note?: string): Promise<IngestionCandidate | null> {
    const c = await this.findById(id)
    if (!c) return null
    if (c.status !== 'pending') {
      throw new Error('Only pending candidates can be marked duplicate')
    }

    await query(
      `
      UPDATE ingestion_candidates SET
        status = 'duplicate',
        merged_data_center_id = $2,
        resolution_note = $3,
        resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
      [id, existingDataCenterId, note ?? 'Duplicate of existing facility']
    )

    return this.findById(id)
  }
}
