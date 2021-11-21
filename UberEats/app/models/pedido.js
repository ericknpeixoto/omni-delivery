var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pedidoSchema = new Schema({
    cnpjRestaturante: String,
    cpfCliente: String,
    valor: Number,
    cupomDesconto: Number,
    custoItens: Number,
    total: Number,
    frete: Number,
    enderecoEntrega: String,
    cidade: String,
    estado: String,
    uf: String,
    cep: String,
    dataSolicitacao: Date,
    prazoEntrega: Date,
    dataSaida: Date,
    dataFinalizacao: Date,
    situacao: String,  
    statusPedido: Number,
    itens : [{
                idItemCatalogo: Number,
                quantidade: Number,
                preco: Number
            }]
});

module.exports = mongoose.model('Pedido', pedidoSchema);

