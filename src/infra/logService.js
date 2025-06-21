const ILogService = require('./interfaces/ILogService');
const { createLogger, transports, format } = require('winston');

class LogService extends ILogService {
    constructor() {
        super();
        this.logger = createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp(),
                format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`)
            ),
            transports: [new transports.Console()]
        });
    }

    info(message) {
        this.logger.info(message);
    }

    warn(message) {
        this.logger.warn(message);
    }

    error(message) {
        this.logger.error(message);
    }

    logMessage(level, message) {
        switch (level) {
            case 'Info':
                this.info(message);
                break;
            case 'Warning':
                this.warn(message);
                break;
            case 'Error':
            case 'FatalError':
                this.error(message);
                break;
            default:
                this.info(message);
                break;
        }
    }
}

module.exports = LogService;
