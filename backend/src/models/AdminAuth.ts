import { query } from '../db/connection'

export class AdminAuthModel {
  /** Singleton row is created by schema.sql migration. */
  static async getPasswordHash(): Promise<string | null> {
    const result = await query(
      `SELECT password_hash FROM admin_auth WHERE singleton = 1`
    )
    if (result.rows.length === 0) return null
    const row = result.rows[0] as { password_hash: string | null }
    return row.password_hash
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
