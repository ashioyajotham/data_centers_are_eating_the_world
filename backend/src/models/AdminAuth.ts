import { query } from '../db/connection'

export type AdminPasswordState =
  | { kind: 'ok'; hash: string | null }
  | { kind: 'table_missing' }

export class AdminAuthModel {
  /**
   * Reads bcrypt hash for singleton admin row.
   * If `admin_auth` is missing (old DB), returns `table_missing` instead of throwing.
   */
  static async getPasswordState(): Promise<AdminPasswordState> {
    try {
      const result = await query(
        `SELECT password_hash FROM admin_auth WHERE singleton = 1`
      )
      if (result.rows.length === 0) return { kind: 'ok', hash: null }
      const row = result.rows[0] as { password_hash: string | null }
      return { kind: 'ok', hash: row.password_hash }
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === '42P01') {
        return { kind: 'table_missing' }
      }
      throw e
    }
  }

  static async setPasswordHash(passwordHash: string): Promise<void> {
    await query(
      `INSERT INTO admin_auth (singleton, password_hash, updated_at)
       VALUES (1, $1, CURRENT_TIMESTAMP)
       ON CONFLICT (singleton) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           updated_at = EXCLUDED.updated_at`,
      [passwordHash]
    )
  }
}
