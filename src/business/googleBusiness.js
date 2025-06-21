const IGoogleBusiness = require('./interfaces/IGoogleBusiness');
const { google } = require('googleapis');
const CriticalLevel = require('../models/enums/criticalLevel');
const DetalhesMedico = require('../models/detalhesMedico');
const DetalhesMedicoBloqueio = require('../models/detalhesMedicoBloqueio');

class GoogleBusiness extends IGoogleBusiness {
    constructor({ config, log, globalProvider }) {
        super();
        this.config = config;
        this.log = log;
        this.globalProvider = globalProvider;
    }

    async listMedicalDetails() {
        const listRegistrationDoctors = [];
        const listRegistrationDoctorBlock = [];
        const listToReturn = [];

        try {
            this.log.logMessage(CriticalLevel.Info, `Coletando informações da planilha de distribuição de laudos - processId ${this.globalProvider.getDateNow()}`);

            const auth = new google.auth.GoogleAuth({
                credentials: JSON.parse(this.config.googleServiceAccount),
                scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
            });

            const sheets = google.sheets({ version: 'v4', auth });

            const spreadsheetId = this.config.googleSpreadsheetId;
            const range = this.config.googleSpreadsheetRange;

            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range
            });

            const rows = response.data.values;

            if (!rows || rows.length === 0) {
                this.log.logMessage(CriticalLevel.Warning, 'Nenhum dado encontrado na planilha.');
                return [];
            }

            for (const row of rows) {
                // Adapte os índices conforme sua planilha
                const id_medico = row[0] || null;
                const exame = row[1] || null;
                const procedimento = row[2] || null;
                const participacao = parseFloat(row[3]) || 100;
                const bloqueado = row[4] === 'TRUE';
                const motivo = row[5] || null;

                if (bloqueado) {
                    listRegistrationDoctorBlock.push(new DetalhesMedicoBloqueio({
                        id_medico,
                        motivo,
                        bloqueado
                    }));
                } else {
                    listRegistrationDoctors.push(new DetalhesMedico({
                        id_medico,
                        exame,
                        procedimento,
                        participacao
                    }));
                }
            }

            listToReturn.push(...listRegistrationDoctors);

            if (listRegistrationDoctorBlock.length > 0) {
                this.log.logMessage(CriticalLevel.Warning, `Encontrado ${listRegistrationDoctorBlock.length} médicos bloqueados.`);
            }

            return listToReturn;
        } catch (error) {
            this.log.logMessage(CriticalLevel.FatalError, `Erro ao coletar dados da planilha: ${error.message}`);
            throw error;
        }
    }
}

module.exports = GoogleBusiness;
