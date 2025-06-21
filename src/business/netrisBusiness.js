const CriticalLevel = require('../models/enums/criticalLevel');

class NetrisBusiness {
    constructor({ log, netrisRepository, googleBusiness, globalProvider }) {
        this.googleBusiness = googleBusiness;
        this.netrisRepository = netrisRepository;
        this.log = log;
        this.globalProvider = globalProvider;
    }

    async listAtendimentos() {
        const listMedicalCares = [];
        let hasMoreDoctorCares = true;
        let page = 1;

        try {
            this.log.logMessage(CriticalLevel.Normal, `\t Coletando informações de atendimentos com o processId ${this.globalProvider.getProcessId()}`);

            const dataInicio = new Date();
            dataInicio.setDate(dataInicio.getDate() - 3);
            const dataFim = new Date();

            while (hasMoreDoctorCares) {
                this.log.logMessage(CriticalLevel.Normal, `\t Coletando informações dos atendimentos pagina: ${page}`);
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
            this.log.logMessage(CriticalLevel.FatalError, error.message);
            return listMedicalCares;
        }
    }

    async listarMedicosCedeco() {
        const response = [];
        let hasMoreDoctors = true;
        let page = 1;

        try {
            this.log.logMessage(CriticalLevel.Normal, `\t Listando medicos cadastrados processId ${this.globalProvider.getProcessId()}`);

            while (hasMoreDoctors) {
                this.log.logMessage(CriticalLevel.Normal, `\t Coletando informações dos médicos pagina: ${page}`);
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
            this.log.logMessage(CriticalLevel.FatalError, error.message);
            return response;
        }
    }

    async listarMedico() {
        const listDoctorsAndDetails = [];

        try {
            this.log.logMessage(CriticalLevel.Normal, `\t Listando médicos cadastrados processId ${this.globalProvider.getProcessId()}`);

            const listMedicalDetails = await this.googleBusiness.listMedicalDetails();
            const listOriginDoctors = await this.netrisRepository.listarMedicosCedeco();

            for (const detailsDoctor of listMedicalDetails) {
                const match = listOriginDoctors.find(
                    o => String(o.crm).trim() === String(detailsDoctor.crm).trim()
                );

                if (match) {
                    detailsDoctor.id_medico = match.id_medico;
                    detailsDoctor.crm_estado_medico_executor = match.estado_crm;
                    listDoctorsAndDetails.push(detailsDoctor);
                }
            }

            return listDoctorsAndDetails;
        } catch (error) {
            this.log.logMessage(CriticalLevel.FatalError, error.message);
            return listDoctorsAndDetails;
        }
    }

    async proximoMedico(atendimento, listDoctors) {
        const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
        const diaSemanaCorrente = diasSemana[new Date().getDay()];
        const horaCorrente = new Date();
        const medicosEleitos = [];

        try {
            const examesCadastrados = listDoctors.map(o => o.exame);
            if (!examesCadastrados.includes(atendimento.descricaoModalidade)) {
                return null;
            }

            this.log.logMessage(CriticalLevel.Normal, `\t Elegendo proximo médico para ser o laudador processId ${this.globalProvider.getProcessId()}`);

            const candidatos = listDoctors.filter(o =>
                o.dias_da_semana.some(e => e.includes(diaSemanaCorrente)) &&
                new Date(`1970-01-01T${o.inicio}:00`).getHours() <= horaCorrente.getHours() &&
                new Date(`1970-01-01T${o.fim}:00`).getHours() >= horaCorrente.getHours() &&
                o.procedimento.toLowerCase().includes(atendimento.nomeProcedimento.toLowerCase()) &&
                o.exame.toLowerCase().includes(atendimento.descricaoModalidade.toLowerCase())
            );

            for (const medico of candidatos) {
                const isEleito = await this.netrisRepository.elegerMedico(medico);
                if (isEleito > 0) {
                    medicosEleitos.push(medico);
                }
            }

            if (medicosEleitos.length > 0) {
                const escolhido = medicosEleitos[0];
                atendimento.idMedicoExecutorEleito = escolhido.id_medico;
                atendimento.crmMedicoExecutor = escolhido.crm;
                atendimento.crmEstadoMedicoExecutor = escolhido.crm_estado_medico_executor;
                return atendimento;
            }

            return null;
        } catch (error) {
            this.log.logMessage(CriticalLevel.FatalError, error.message);
            return null;
        }
    }

    async inserirRegistroMedicoLaudador(atendimento) {
        try {
            this.log.logMessage(CriticalLevel.Normal, `\t Inserindo médico laudador ${atendimento.idMedicoExecutorEleito} no atendimento ${atendimento.idAtendimento} processId ${this.globalProvider.getProcessId()}`);

            const response = await this.netrisRepository.updateDoctorExecutor(
                atendimento.idAtendimento,
                atendimento.crmMedicoExecutor,
                atendimento.crmEstadoMedicoExecutor,
                atendimento.idMedicoExecutorEleito
            );

            if (response) {
                await this.netrisRepository.insertDeliberacao({
                    DataCriacao: new Date(),
                    IdAtendimento: atendimento.idAtendimento,
                    IdMedico: atendimento.idMedicoExecutorEleito,
                    Procedimento: atendimento.descricaoModalidade
                });

                this.log.logMessage(CriticalLevel.Normal, `\t Médico executor ${atendimento.idMedicoExecutorEleito} inserido com sucesso no atendimento ${atendimento.idAtendimento} processId ${this.globalProvider.getProcessId()}`);
            }

            return response;
        } catch (error) {
            this.log.logMessage(CriticalLevel.FatalError, error.message);
            return false;
        }
    }

    async insertIntoMedicoCedeco(listMedicos) {
        let processados = 0;

        try {
            for (const medico of listMedicos) {
                await this.netrisRepository.insertIntoMedicoCedeco(medico);
                processados++;
                this.log.logMessage(CriticalLevel.Normal, `Medico inserido com sucesso. Já foram processados: ${processados}`);
            }

            return processados;
        } catch (error) {
            this.log.logMessage(CriticalLevel.FatalError, error.message);
            return processados;
        }
    }
}

module.exports = NetrisBusiness;
