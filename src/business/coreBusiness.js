const ICoreBusiness = require('./interfaces/ICoreBusiness');
const CriticalLevel = require('../models/enums/criticalLevel');

class CoreBusiness extends ICoreBusiness {
    constructor({ googleBusiness, netrisBusiness, log, config, args }) {
        super();
        this.googleBusiness = googleBusiness;
        this.netrisBusiness = netrisBusiness;
        this.log = log;
        this.config = config;
        this.businessId = parseInt(config.businessId);
        this.args = args || [];

        if (this.args.length > 0) {
            this.log.logMessage(CriticalLevel.Info, `Argumentos recebidos: ${this.args.join(', ')}`);
        } else {
            this.log.logMessage(CriticalLevel.Info, 'Nenhum argumento foi recebido.');
        }
    }

    async executeAsync() {
        this.log.logMessage(CriticalLevel.Info, `Iniciando coleta de atendimentos para o BusinessId: ${this.businessId}`);

        const rotina = this.args[0]?.toUpperCase() || '';
        const active = this.config.features?.active ?? true;
        const limiteRegister = this.config.features?.data?.limiteRegister ?? 100;

        try {
            switch (rotina) {
                case 'CARGA_MEDICOS':
                    await this.executarCargaDeMedicos();
                    break;

                case 'MEDICO_LAUDADOR':
                    await this.executarMedicoLaudador();
                    break;

                default:
                    this.log.logMessage(CriticalLevel.Warning, `Nenhuma rotina válida informada.`);
                    break;
            }

            this.log.logMessage(CriticalLevel.Info, `Rotina concluída.`);
        } catch (error) {
            this.log.logMessage(CriticalLevel.FatalError, `Erro na execução da rotina: ${error.message}`);
        }
    }

    async executarCargaDeMedicos() {
        this.log.logMessage(CriticalLevel.Info, `Executando rotina de carga de médicos.`);

        const listDoctors = await this.netrisBusiness.listarMedicosCedeco();
        let countInseridos = 0;

        for (const medico of listDoctors) {
            const sucesso = await this.netrisBusiness.insertIntoMedicoCedeco(medico);
            if (sucesso) countInseridos++;
        }

        this.log.logMessage(CriticalLevel.Info, `Foram inseridos ${countInseridos} médicos na base de dados.`);
    }

    async executarMedicoLaudador() {
        this.log.logMessage(CriticalLevel.Info, `Executando rotina de médicos laudadores.`);

        const atendimentos = await this.netrisBusiness.listarAtendimentos();

        this.log.logMessage(CriticalLevel.Info, `Foram encontrados ${atendimentos.length} atendimentos.`);

        // Você pode aplicar aqui qualquer outra regra adicional
    }
}

module.exports = CoreBusiness;
