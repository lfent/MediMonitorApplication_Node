const IGlobalProvider = require('./interfaces/IGlobalProvider');

class GlobalProvider extends IGlobalProvider {
    constructor({ log }) {
        super();
        this.log = log;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getDateNow() {
        return new Date().toISOString();
    }
}

module.exports = GlobalProvider;
