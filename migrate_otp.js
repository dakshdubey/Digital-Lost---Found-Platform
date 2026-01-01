const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to DB. Running Migration...');

        try {
            await connection.execute('ALTER TABLE lost_items ADD COLUMN release_code VARCHAR(6)');
            console.log('Added release_code column to lost_items table.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('Column release_code already exists.');
            } else {
                throw e;
            }
        }

        await connection.end();
        console.log('Migration Complete.');
        process.exit(0);
    } catch (e) {
        console.error('Migration Failed:', e);
        process.exit(1);
    }
}

migrate();
