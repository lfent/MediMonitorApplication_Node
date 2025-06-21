class Deliberacao {
    constructor({
        Id = null,
        DataCriacao = null,
        IdAtendimento = null,
        IdMedico = null,
        RetornoApi = null,
        Procedimento = null
    } = {}) {
        this.Id = Id;
        this.DataCriacao = DataCriacao;
        this.IdAtendimento = IdAtendimento;
        this.IdMedico = IdMedico;
        this.RetornoApi = RetornoApi;
        this.Procedimento = Procedimento;
    }
}

module.exports = Deliberacao;
