const db = require('./database');
const log = require('../infra/logService');

class BaseRepository {
    async executeQuery(sql, params = []) {
        try {
            return await db.executeQuery(sql, params);
        } catch (error) {
            log.error(`Erro na execução da query: ${error.message}`);
            throw error;
        }
    }
}

module.exports = BaseRepository;
