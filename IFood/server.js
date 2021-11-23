const express = require('express');
const pedidoRoutes = require('./routes/pedidoRoutes.js')

/**
 * Configuração do App
 */
const app = express();
app.use(express.json());

app.listen(3000, () =>
    console.log('Executando o serviço "ifood" na Porta 3000.')
);

/**
 * Configuração das Rotas
 */
app.use('/pedido', pedidoRoutes);
