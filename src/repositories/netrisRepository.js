const INetrisRepository = require('./interfaces/INetrisRepository');
const axios = require('axios');
const config = require('../infra/config/config');
const log = require('../infra/logService');
const CriticalLevel = require('../models/enums/criticalLevel');
const db = require('./database');

class NetrisRepository extends INetrisRepository {
    constructor() {
        super();
        this.apiUrl = config.apiUrl;
        this.token = config.token;
        this.idMedicoExecutor = config.idMedicoExecutor;

        this.httpClient = axios.create({
            baseURL: this.apiUrl,
            headers: {
                Authorization: this.token,
                Accept: 'application/json'
            }
        });
    }

    async listarMedicos(page = 1) {
        try {
            const response = await this.httpClient.get('/netris/api/medicos', {
                params: { page, limit: 100, distinct: true }
            });
            return response.data;
        } catch (error) {
            log.error(`Erro listarMedicos: ${error.message}`);
            throw error;
        }
    }

    async listarMedicosCedeco() {
        const sql = `SELECT * FROM MedicosCedeco WHERE executor = 1`;
        return await db.executeQuery(sql);
    }

    async listarAtendimentos(status, dataInicial, dataFinal, page = 1) {
        try {
            const response = await this.httpClient.get('/netris/api/atendimentos', {
                params: {
                    dataInicial,
                    dataFinal,
                    idMedicoExecutor: this.idMedicoExecutor,
                    status: status.toUpperCase(),
                    page,
                    limit: 100
                }
            });
            return response.data;
        } catch (error) {
            log.error(`Erro listarAtendimentos: ${error.message}`);
            throw error;
        }
    }

    // Outros métodos conforme sua necessidade (elegerMedico, insertDeliberacao, etc.)
}

module.exports = NetrisRepository;
