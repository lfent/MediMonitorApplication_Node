class DetalhesMedico {
    constructor({
        id_medico = null,
        exame = null,
        procedimento = null,
        participacao = null
    } = {}) {
        this.id_medico = id_medico;
        this.exame = exame;
        this.procedimento = procedimento;
        this.participacao = participacao;
    }
}

module.exports = DetalhesMedico;
