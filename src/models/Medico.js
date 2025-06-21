class Medico {
    constructor({
        id_medico = null,
        nome = null,
        crm = null,
        estado_crm = null,
        conselho_profissional = null,
        executor = null,
        id_profissional = null
    } = {}) {
        this.id_medico = id_medico;
        this.nome = nome;
        this.crm = crm;
        this.estado_crm = estado_crm;
        this.conselho_profissional = conselho_profissional;
        this.executor = executor;
        this.id_profissional = id_profissional;
    }
}

module.exports = Medico;
