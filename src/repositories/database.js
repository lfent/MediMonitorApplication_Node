const mysql = require('mysql2/promise');
const config = require('../infra/config/config');
const log = require('../infra/logService');

const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.on('error', (err) => {
    log.error(`Erro na pool de conexão: ${err.message}`);
});

async function executeQuery(sql, params = []) {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch (error) {
        log.error(`Erro na execução da query: ${error.message}`);
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    executeQuery
};
