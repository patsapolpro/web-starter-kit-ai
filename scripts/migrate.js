/**
 * Database Migration Script
 *
 * This script runs the SQL schema to set up the database tables.
 * Usage: node scripts/migrate.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigrations() {
  console.log('🔄 Starting database migration...\n');

  // Load environment variables
  require('dotenv').config({ path: '.env.local' });

  if (!process.env.POSTGRES_URL) {
    console.error('❌ Error: POSTGRES_URL environment variable is not set');
    console.error('   Please create .env.local file with POSTGRES_URL');
    process.exit(1);
  }

  console.log('📡 Connecting to database...');
  console.log(`   Host: ${new URL(process.env.POSTGRES_URL).hostname}\n`);

  const db = new Client({
    connectionString: process.env.POSTGRES_URL,
    // Set timeouts to ensure connections don't hang
    connectionTimeoutMillis: 5000,
    query_timeout: 30000,
  });

  console.log('🔌 Establishing connection...');
  await db.connect();
  console.log('✅ Connected!\n');

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    await db.query('SELECT NOW()');
    console.log('✅ Connection successful!\n');

    // Read schema file
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded\n');

    // Execute schema
    console.log('🚀 Executing migrations...');
    await db.query(schema);
    console.log('✅ Migrations completed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('✅ Tables created:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n🎉 Database setup complete!');
    console.log('   You can now start the development server with: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error('   Error:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    try {
      await db.end();
    } catch (err) {
      // Ignore cleanup errors
    }
  }
}

// Run migrations
runMigrations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
