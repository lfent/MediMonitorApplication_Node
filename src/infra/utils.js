class Utils {
    static gerarHash(texto) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(texto).digest('hex');
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static dateNow() {
        return new Date().toISOString();
    }
}

module.exports = Utils;
