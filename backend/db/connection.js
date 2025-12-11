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

        // Read and execute schema
        const schemaPath = join(__dirname, 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf-8');
        await client.query(schema);
        console.log('✓ Database schema initialized');

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
        console.log('Executed query', { text, duration, rows: res.rowCount });
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
