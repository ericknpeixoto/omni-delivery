
const mongoose = require('mongoose');

module.exports = mongoose.model('Pedido', {
    cnpjRestaurante: String,
    cpfCliente: String,
    valor: Number,
    cupomDesconto: Number,
    total: Number,
    enderecoEntrega: String,
    cidade: String,
    estado: String,
    uf: String,
    cep: String,
    dataSolicitacao: Date,
    prazoEntrega: Date,
    dataFinalizacao: Date,
    status: Number,  
});
