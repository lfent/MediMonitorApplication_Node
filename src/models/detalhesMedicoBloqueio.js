class DetalhesMedicoBloqueio {
    constructor({
        id_medico = null,
        motivo = null,
        bloqueado = false
    } = {}) {
        this.id_medico = id_medico;
        this.motivo = motivo;
        this.bloqueado = bloqueado;
    }
}

module.exports = DetalhesMedicoBloqueio;
