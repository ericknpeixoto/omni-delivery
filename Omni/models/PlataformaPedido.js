const mongoose = require('mongoose');

module.exports = mongoose.model('plataforma_pedidos', {
  nome: String,
  email: String,
  url: String,
  ultimaAtualizacao: Date,
  isAtivo: Boolean,
})