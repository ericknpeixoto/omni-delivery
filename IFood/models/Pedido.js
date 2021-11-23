class Pedido {
    constructor(dadosPedido) {
        let custo = this.calcularCusto(dadosPedido.itens);
        let custoFinal = custo + dadosPedido.frete - dadosPedido.desconto;

        this.cnpj = dadosPedido.cnpj;
        this.cpf = dadosPedido.cpf;
        this.logradouro = dadosPedido.logradouro;
        this.numeroEndereco = dadosPedido.numeroEndereco;
        this.complementoEndereco = dadosPedido.complementoEndereco;
        this.bairro = dadosPedido.bairro;
        this.cidade = dadosPedido.cidade;
        this.uf = dadosPedido.uf;
        this.cep = dadosPedido.cep;
        this.itensPedido = dadosPedido.itens;
        this.custo = custo;
        this.frete = dadosPedido.frete;
        this.desconto = dadosPedido.desconto;
        this.custoFinal = custoFinal;
    }

    getDados() {
        return {
            cnpj: this.cnpj,
            cpf: this.cpf,
            logradouro: this.logradouro,
            numeroEndereco: this.numeroEndereco,
            complementoEndereco: this.complementoEndereco,
            bairro: this.bairro,
            cidade: this.cidade,
            uf: this.uf,
            cep: this.cep,
            itensPedido: this.itensPedido,
            custo: this.custo,
            frete: this.frete,
            desconto: this.desconto,
            custoFinal: this.custoFinal,
        };
    }

    calcularCusto(itens) {
        let custo = 0;

        for (let item of itens) {
            custo += item.quantidade * item.precoUnitario;
        }

        return custo;
    }
}

module.exports = Pedido;
