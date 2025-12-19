/**
 * Database Connection and Client Setup
 *
 * This module provides PostgreSQL database connectivity using the pg library.
 * It supports standard PostgreSQL connections.
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

/**
 * Database pool instance
 * Uses connection pooling for better performance
 */
let poolInstance: Pool | null = null;

function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = new Pool({
      connectionString: process.env.POSTGRES_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    poolInstance.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return poolInstance;
}

/**
 * SQL template tag for queries
 * Mimics the @vercel/postgres sql`` template tag syntax
 */
export const sql = async <T extends QueryResultRow = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<QueryResult<T>> => {
  const pool = getPool();

  // Convert template strings to parameterized query
  let text = '';
  const params: any[] = [];

  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      text += `$${params.length}`;
    }
  }

  return pool.query<T>(text, params);
};

// Add query method to sql for compatibility
(sql as any).query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const pool = getPool();
  return pool.query<T>(text, params);
};

/**
 * Custom Database Error class
 */
export class DatabaseError extends Error {
  public originalError?: any;

  constructor(message: string, originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

/**
 * Check database connection
 *
 * @returns true if connection is successful
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Initialize database (run migrations)
 * This should be called during setup or deployment
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const pool = getPool();
    // Check if tables exist
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'projects'
      );
    `);

    const tablesExist = result.rows[0]?.exists;

    if (!tablesExist) {
      console.log('Tables do not exist. Please run the schema.sql file manually.');
      throw new Error(
        'Database tables not found. Please run: npm run db:migrate'
      );
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Transaction helper
 * Executes multiple queries in a transaction
 *
 * @param callback - Function containing queries to execute
 * @returns Result of the callback
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw new DatabaseError('Transaction failed', error);
  } finally {
    client.release();
  }
}

/**
 * Close database connections
 * Useful for graceful shutdowns
 */
export async function closeConnections(): Promise<void> {
  try {
    if (poolInstance) {
      await poolInstance.end();
      poolInstance = null;
    }
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
}

/**
 * Direct pool access for advanced use cases
 */
export function getPoolInstance(): Pool {
  return getPool();
}
