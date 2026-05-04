import fs from 'fs'
import path from 'path'
import pool from './connection'

/**
 * Apply SQL files from src/db/migrations once each (tracked in schema_migrations).
 * Run after deploy: cd backend && npm run db:migrate
 */
function resolveMigrationsDir(): string | null {
  const candidates = [
    path.join(__dirname, 'migrations'),
    path.join(process.cwd(), 'src', 'db', 'migrations'),
    path.join(process.cwd(), 'dist', 'db', 'migrations'),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return null
}

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const dir = resolveMigrationsDir()
    if (!dir) {
      console.log('No migrations directory found; nothing to do.')
      process.exit(0)
    }

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    for (const filename of files) {
      const done = await pool.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [
        filename,
      ])
      if (done.rows.length > 0) {
        console.log(`⏭️  Skip ${filename} (already applied)`)
        continue
      }

      const sql = fs.readFileSync(path.join(dir, filename), 'utf-8')
      console.log(`📦 Applying ${filename}...`)
      await pool.query(sql)
      await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename])
      console.log(`✅ Applied ${filename}`)
    }

    console.log('🎉 Migrations complete')
    process.exit(0)
  } catch (e) {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  }
}

migrate()
