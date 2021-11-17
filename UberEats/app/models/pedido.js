var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pedidoSchema = new Schema({
    cnpjRestaturante: String,
    cpfCliente: String,
    valor: Number,
    cupomDesconto: Number,
    total: Number,
    frete: Number,
    enderecoEntrega: String,
    cidade: String,
    estado: String,
    uf: String,
    cep: String,
    dataSolicitacao: Date,
    prazoEntrega: Date,
    dataFinalizacao: Date,
    situacao: String,  
    itens : [{
                idItemCatalogo: Number,
                quantidade: Number,
                preco: Number
            }]
});

module.exports = mongoose.model('Pedido', pedidoSchema);

