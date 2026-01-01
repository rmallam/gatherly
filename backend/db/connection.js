import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection and initialize schema
export async function initializeDatabase() {
    try {
        // Test connection
        const client = await pool.connect();
        console.log('✓ PostgreSQL connected successfully');

        // Check if tables exist (simple health check)
        try {
            await client.query('SELECT 1 FROM users LIMIT 1');
            console.log('✓ Database tables verified');
        } catch (err) {
            console.warn('⚠️  Database tables may not exist. Run migrations manually if needed.');
        }

        client.release();
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

// Query helper function
export async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        // Only log slow queries (> 1000ms)
        if (duration > 1000) {
            console.warn('Slow query detected', { duration, rows: res.rowCount });
        }
        return res;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

// Transaction helper
export async function transaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export default pool;
