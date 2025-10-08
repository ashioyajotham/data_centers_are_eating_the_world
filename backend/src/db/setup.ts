import fs from 'fs'
import path from 'path'
import pool from './connection'

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...')
    
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf-8')
    
    await pool.query(schema)
    
    console.log('✅ Database setup completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()

