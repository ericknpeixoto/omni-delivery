const mongoose = require('mongoose');

module.exports = mongoose.model('pedidos', {
    idPlataforma: String,
    idPedido: String,
    custo: Number,
    desconto: Number,
    frete: Number,
    total: Number,
    data: Date,
    status: Number,
});
