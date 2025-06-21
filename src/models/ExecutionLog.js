class ExecutionLog {
    constructor({
        id = null,
        message = null,
        level = null,
        date = new Date().toISOString()
    } = {}) {
        this.id = id;
        this.message = message;
        this.level = level;
        this.date = date;
    }
}

module.exports = ExecutionLog;
