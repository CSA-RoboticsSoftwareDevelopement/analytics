const mysql = require('mysql2/promise');

async function test() {
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 61567,
            user: 'db',
            password: 'db',
            database: 'db'
        });
        console.log("✅ DDEV Database connected successfully!");
        await connection.end();
    } catch (err) {
        console.error("❌ Connection failed:", err.message);
    }
}
test();