class Atendimento {
    constructor({
        id = null,
        data = null,
        status = null,
        idMedicoExecutor = null,
        procedimento = null
    } = {}) {
        this.id = id;
        this.data = data;
        this.status = status;
        this.idMedicoExecutor = idMedicoExecutor;
        this.procedimento = procedimento;
    }
}

module.exports = Atendimento;
