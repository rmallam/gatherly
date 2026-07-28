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

            // Auto-run OTP migration if needed (Quick fix for production)
            try {
                // Check if otp_codes exists
                await client.query('SELECT 1 FROM otp_codes LIMIT 1');
            } catch (err) {
                console.log('Creating otp_codes table...');
                const migrationPath = join(__dirname, '../migrations/08_create_otp_codes.sql');
                const migrationSql = await fs.readFile(migrationPath, 'utf8');
                await client.query(migrationSql);
                console.log('✓ Created otp_codes table');
            }

            // Auto-run Gift Registries migration if needed
            try {
                await client.query('SELECT 1 FROM gift_registries LIMIT 1');
            } catch (err) {
                console.log('Creating gift_registries table...');
                const migrationPath = join(__dirname, '../migrations/09_create_gifts_table.sql');
                const migrationSql = await fs.readFile(migrationPath, 'utf8');
                await client.query(migrationSql);
                console.log('✓ Created gift_registries table');
            }

            // Auto-run 005_add_expense_line_items migration if needed
            try {
                await client.query('SELECT split_type FROM event_expenses LIMIT 1');
            } catch (err) {
                console.log('Running 005_add_expense_line_items migration...');
                const migrationPath = join(__dirname, '../migrations/005_add_expense_line_items.sql');
                const migrationSql = await fs.readFile(migrationPath, 'utf8');
                await client.query(migrationSql);
                console.log('✓ Ran 005_add_expense_line_items migration');
            }

            // Auto-run passwordless auth OTP table if needed
            try {
                await client.query('SELECT 1 FROM auth_otp_codes LIMIT 1');
            } catch (err) {
                console.log('Creating auth_otp_codes table...');
                const migrationPath = join(__dirname, '../migrations/010_auth_otp_codes.sql');
                const migrationSql = await fs.readFile(migrationPath, 'utf8');
                await client.query(migrationSql);
                console.log('✓ Created auth_otp_codes table');
            }


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
