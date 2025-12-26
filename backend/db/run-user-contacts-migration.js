import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use environment variable or fallback to hardcoded connection string
const connectionString = process.env.DATABASE_URL ||
    'postgresql://gatherly:2aW3Xc0fIiBlr5kXjPkp0z79v233cYdv@dpg-d4t4hl56ubrc73ed5ucg-a/gatherlydb';

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runUserContactsMigration() {
    try {
        await client.connect();
        console.log('✓ Connected to database');

        // Read the migration file
        const migrationPath = join(__dirname, 'migrations', '20241225_user_contacts.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running user_contacts migration...');

        // Run the migration
        await client.query(migrationSQL);

        console.log('✅ user_contacts migration completed successfully!');

        // Verify the table was created
        const verification = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user_contacts'
            ORDER BY ordinal_position;
        `);

        console.log('\n📋 Created table columns:');
        verification.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runUserContactsMigration();
