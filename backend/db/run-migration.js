import pg from 'pg';
const { Client } = pg;

const client = new Client({
    connectionString: 'postgresql://gatherly:2aW3Xc0fIiBlr5kXjPkp0z79v233cYdv@dpg-d4t4hl56ubrc73ed5ucg-a/gatherlydb',
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Add data column
        const result1 = await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb
        `);
        console.log('✓ Added data column');

        // Update existing rows
        const result2 = await client.query(`
            UPDATE events 
            SET data = '{}'::jsonb 
            WHERE data IS NULL
        `);
        console.log(`✓ Updated ${result2.rowCount} existing events`);

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
