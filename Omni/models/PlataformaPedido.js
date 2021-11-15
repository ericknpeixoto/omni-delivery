const mongoose = require('mongoose');

module.exports = mongoose.model('plataforma_pedidos', {
  nome: String,
  email: String,
  isAtivo: Boolean,
  ultimaAtualizacao: Date
})