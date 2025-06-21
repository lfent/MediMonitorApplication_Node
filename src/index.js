const container = require('./container');
const CriticalLevel = require('./models/enums/criticalLevel');

async function main() {
    const log = container.resolve('log');
    const coreBusiness = container.resolve('coreBusiness');

    try {
        log.logMessage(CriticalLevel.Info, 'Iniciando aplicação MediMonitor');

        await coreBusiness.executeAsync();

        log.logMessage(CriticalLevel.Info, 'Execução finalizada com sucesso');
        process.exit(0);
    } catch (error) {
        log.logMessage(CriticalLevel.FatalError, `Erro fatal: ${error.message}`);
        process.exit(1);
    }
}

main();
