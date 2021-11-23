const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');

const Pedido = require('./models/Pedido.js');
const pedidoRoutes = require('./routes/pedidoRoutes.js')

require('dotenv').config();
const env = process.env;

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
