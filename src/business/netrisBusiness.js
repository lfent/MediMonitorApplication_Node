const INetrisBusiness = require('./interfaces/INetrisBusiness');
const CriticalLevel = require('../models/enums/criticalLevel');

class NetrisBusiness extends INetrisBusiness {
    constructor({ netrisRepository, googleBusiness, log, globalProvider }) {
        super();
        this.netrisRepository = netrisRepository;
        this.googleBusiness = googleBusiness;
        this.log = log;
        this.globalProvider = globalProvider;
    }

    // 🔍 Listar Atendimentos
    async listarAtendimentos() {
        const listMedicalCares = [];
        let hasMoreDoctorCares = true;
        let page = 1;

        try {
            this.log.logMessage(CriticalLevel.Info, `Coletando informações de atendimentos com o processId ${this.globalProvider.getDateNow()}`);

            const dataInicio = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
            const dataFim = new Date().toLocaleDateString('pt-BR');

            while (hasMoreDoctorCares) {
                this.log.logMessage(CriticalLevel.Info, `Coletando informações dos atendimentos página: ${page}`);

                const result = await this.netrisRepository.listarAtendimentos('LAUDAR', dataInicio, dataFim, page);

                if (!result || result.length === 0) {
                    hasMoreDoctorCares = false;
                } else {
                    listMedicalCares.push(...result);
                    page++;
                }
            }

            return listMedicalCares;
        } catch (error) {
            this.log.logMessage(CriticalLevel.FatalError, `Erro listarAtendimentos: ${error.message}`);
            return listMedicalCares;
        }
    }

    // 👨‍⚕️ Listar Médicos Cedeco
    async listarMedicosCedeco() {
        const response = [];
        let hasMoreDoctors = true;
        let page = 1;

        try {
            this.log.logMessage(CriticalLevel.Info, `Listando médicos cadastrados - processId ${this.globalProvider.getDateNow()}`);

            while (hasMoreDoctors) {
                this.log.logMessage(CriticalLevel.Info, `Coletando informações dos médicos página ${page}`);

                const result = await this.netrisRepository.listarMedicos(page);

                if (!result || result.length === 0) {
                    hasMoreDoctors = false;
                } else {
                    response.push(...result);
                    page++;
                }
            }

            return response;
        } catch (error) {
            this.log.logMessage(CriticalLevel.FatalError, `Erro listarMedicosCedeco: ${error.message}`);
            return response;
        }
    }
}

module.exports = NetrisBusiness;
