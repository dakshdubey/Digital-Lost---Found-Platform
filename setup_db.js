const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    try {
        // Connect without database selected first
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Connected to MySQL server.');

        // Read init.sql
        const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
        const statements = sql.split(';').filter(stmt => stmt.trim());

        for (let statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }

        console.log('Database and tables initialized successfully.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error setting up database:', error.message);
        process.exit(1);
    }
}

setupDatabase();
