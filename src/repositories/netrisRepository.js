const axios = require('axios');
const db = require('./database');
const config = require('../infra/config/config');
const log = require('../infra/logService');
const CriticalLevel = require('../models/enums/criticalLevel');
const INetrisRepository = require('./interfaces/INetrisRepository');

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
            log.logMessage(CriticalLevel.Warning, `Erro listarMedicos: ${error.message}`);
            return [];
        }
    }

    async listarMedicosCedeco() {
        const sql = `SELECT * FROM MedicosCedeco WHERE executor = 1`;
        try {
            return await db.executeQuery(sql);
        } catch (error) {
            log.logMessage(CriticalLevel.Warning, `Erro listarMedicosCedeco: ${error.message}`);
            return [];
        }
    }

    async listarAtendimentos(status, dataInicial, dataFinal, page = 1) {
        try {
            const response = await this.httpClient.get('/netris/api/atendimentos', {
                params: {
                    dataInicial,
                    dataFinal,
                    idMedicoExecutor: this.idMedicoExecutor,
                    status: status.toUpperCase(),
                    limit: 100,
                    page
                }
            });
            return response.data;
        } catch (error) {
            log.logMessage(CriticalLevel.Warning, `Erro listarAtendimentos: ${error.message}`);
            return [];
        }
    }

    async listarDeliberacoes() {
        const sql = `SELECT Id, DataCriacao, IdAtendimento, idMedico, RetornoApi FROM RegistroLaudoMedico`;
        try {
            return await db.executeQuery(sql);
        } catch (error) {
            log.logMessage(CriticalLevel.Warning, `Erro listarDeliberacoes: ${error.message}`);
            return [];
        }
    }

    async elegerMedico(detalheMedico) {
        const { id_medico, exame, procedimento, participacao } = detalheMedico;

        const sql = `
            DECLARE @IdMedico INT = ${id_medico};
            DECLARE @Exame NVARCHAR(50) = '${exame}';
            DECLARE @Procedimento NVARCHAR(50) = '${procedimento}';
            DECLARE @Preferencialidade INT = ${participacao};

            WITH TotalCount AS (
                SELECT COUNT(*) AS TotalRegistros
                FROM RegistroLaudoMedico
                WHERE Exame = @Exame AND Procedimento = @Procedimento
            ),
            GroupedCount AS (
                SELECT 
                    idMedico, Exame, Procedimento, COUNT(*) AS QtdRegistros,
                    CAST((COUNT(*) * 100.0) / (SELECT TotalRegistros FROM TotalCount) AS DECIMAL(10,2)) AS Percentual
                FROM RegistroLaudoMedico
                WHERE Exame = @Exame AND Procedimento = @Procedimento
                GROUP BY idMedico, Exame, Procedimento
            ),
            Ponderado AS (
                SELECT 
                    idMedico, Percentual, QtdRegistros,
                    ((100 - Percentual) * (@Preferencialidade / 100.0)) + 
                    (Percentual * ((100 - @Preferencialidade) / 100.0)) + 
                    (QtdRegistros / 10.0) AS ValorPonderado
                FROM GroupedCount
            ),
            Distribuido AS (
                SELECT 
                    idMedico, Percentual, QtdRegistros,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            CASE WHEN @Preferencialidade = 100 AND idMedico = @IdMedico THEN 0 ELSE 1 END,
                            ValorPonderado DESC,
                            QtdRegistros DESC,
                            idMedico ASC
                    ) AS RankPonderado
                FROM Ponderado
            )
            SELECT 
                CASE 
                    WHEN @Preferencialidade = 100 AND @IdMedico IN (SELECT idMedico FROM GroupedCount) THEN 1
                    WHEN NOT EXISTS (SELECT 1 FROM GroupedCount WHERE idMedico = @IdMedico) THEN 1
                    WHEN (SELECT COUNT(*) FROM GroupedCount) = 1 THEN 0
                    WHEN EXISTS (SELECT 1 FROM Distribuido d WHERE d.idMedico = @IdMedico AND d.RankPonderado = 1) THEN 0
                    ELSE 1
                END AS Elegivel;
        `;

        try {
            const result = await db.executeQuery(sql);
            return result[0]?.Elegivel || 0;
        } catch (error) {
            log.logMessage(CriticalLevel.Warning, `Erro elegerMedico: ${error.message}`);
            return 0;
        }
    }

    async insertDeliberacao(deliberacao) {
        const sql = `
            INSERT INTO Deliberacao (DataCriacao, IdAtendimento, IdMedico, RetornoApi, Procedimento) 
            VALUES (?, ?, ?, ?, ?);
            SELECT * FROM Deliberacao WHERE Id = LAST_INSERT_ID();
        `;

        const params = [
            deliberacao.DataCriacao,
            deliberacao.IdAtendimento,
            deliberacao.IdMedico,
            deliberacao.RetornoApi,
            deliberacao.Procedimento
        ];

        try {
            return await db.executeQuery(sql, params);
        } catch (error) {
            log.logMessage(CriticalLevel.Warning, `Erro insertDeliberacao: ${error.message}`);
            return [];
        }
    }

    async insertIntoMedicoCedeco(medico) {
        const sql = `
            INSERT INTO MedicosCedeco 
                (id_profissional, estado_crm, executor, id_medico, conselho_profissional, crm) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [
            medico.id_profissional,
            medico.estado_crm,
            medico.executor ? 1 : 0,
            medico.id_medico,
            medico.conselho_profissional,
            medico.crm
        ];

        try {
            await db.executeQuery(sql, params);
            return true;
        } catch (error) {
            log.logMessage(CriticalLevel.Warning, `Erro insertIntoMedicoCedeco: ${error.message}`);
            return false;
        }
    }

    async updateDoctorExecutor(atendimentoId, crmMedicoExecutor, crmEstadoMedicoExecutor, idMedicoExecutor) {
        const payload = {
            crmEstadoMedicoExecutor,
            crmMedicoExecutor,
            idMedicoExecutor
        };

        try {
            const response = await this.httpClient.patch(`/netris/api/atendimentos/${atendimentoId}/alterar-medico-executor`, payload);
            return response.status === 200;
        } catch (error) {
            log.logMessage(CriticalLevel.FatalError, `Erro updateDoctorExecutor: ${error.message}`);
            return false;
        }
    }
}

module.exports = NetrisRepository;
