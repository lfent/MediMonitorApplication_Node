const CriticalLevel = require('../models/enums/criticalLevel');

class CoreBusiness {
    constructor({ googleBusiness, netrisBusiness, log, config, args }) {
        this.googleBusiness = googleBusiness;
        this.netrisBusiness = netrisBusiness;
        this.log = log;
        this.config = config;
        this.args = args;

        this.businessId = parseInt(config.businessId);

        if (args && args.length > 0) {
            this.log.logMessage(CriticalLevel.Normal, `Argumentos recebidos: ${args.join(', ')}`);
        } else {
            this.log.logMessage(CriticalLevel.Normal, 'Nenhum argumento foi recebido.');
        }
    }

    async executeAsync() {
        this.log.logMessage(
            CriticalLevel.Normal,
            `Iniciando coleta de atendimentos para o BusinessId: ${this.businessId}`
        );

        const tasks = [];
        const rotina = this.args && this.args.length > 0 ? this.args[0].toUpperCase() : '';

        const active = this.config.features.active;
        const limiteRegister = this.config.features.data.limiteRegister;

        try {
            switch (rotina) {
                case 'CARGA_MEDICOS':
                    tasks.push(
                        (async () => {
                            const listDoctors = await this.netrisBusiness.listarMedicosCedeco();
                            const medicosInseridos = await this.netrisBusiness.insertIntoMedicoCedeco(listDoctors);

                            if (medicosInseridos > 0) {
                                this.log.logMessage(
                                    CriticalLevel.Normal,
                                    `Foram inseridos ${medicosInseridos} médicos na base de dados.`
                                );
                                process.exit(0);
                            }
                        })()
                    );
                    break;

                case 'MEDICO_LAUDADOR':
                    tasks.push(
                        (async () => {
                            const listAtendimentos = await this.netrisBusiness.listAtendimentos();
                            const listDoctors = await this.netrisBusiness.listarMedico();

                            const limite = active ? limiteRegister : listAtendimentos.length;
                            let count = 0;

                            for (const atendimento of listAtendimentos) {
                                if (count >= limite) break;

                                const atendimentoEleito = await this.netrisBusiness.proximoMedico(atendimento, listDoctors);

                                if (atendimentoEleito) {
                                    const resultado = await this.netrisBusiness.inserirRegistroMedicoLaudador(atendimentoEleito);
                                    if (resultado) {
                                        this.log.logMessage(
                                            CriticalLevel.Normal,
                                            `Atendimento ${atendimentoEleito.idAtendimento} atribuído ao médico ${atendimentoEleito.idMedicoExecutorEleito} com sucesso.`
                                        );
                                    } else {
                                        this.log.logMessage(
                                            CriticalLevel.Warning,
                                            `Falha ao atribuir o médico ao atendimento ${atendimentoEleito.idAtendimento}.`
                                        );
                                    }
                                }

                                count++;
                            }

                            process.exit(0);
                        })()
                    );
                    break;

                default:
                    this.log.logMessage(
                        CriticalLevel.Warning,
                        `Parâmetro '${rotina}' não reconhecido.`
                    );
                    break;
            }
        } catch (error) {
            this.log.logMessage(
                CriticalLevel.FatalError,
                `Erro durante execução: ${error.message}`
            );
        }

        await Promise.all(tasks);
    }

    async startAsync() {
        try {
            this.log.logMessage(CriticalLevel.Normal, 'Iniciando serviço CoreBusiness...');
            await this.executeAsync();
            this.log.logMessage(CriticalLevel.Normal, 'Serviço CoreBusiness concluído.');
        } catch (error) {
            this.log.logMessage(
                CriticalLevel.FatalError,
                `Erro ao iniciar o serviço: ${error.message}`
            );
        }
    }

    async stopAsync() {
        this.log.logMessage(CriticalLevel.Normal, 'Parando serviço CoreBusiness...');
    }
}

module.exports = CoreBusiness;
