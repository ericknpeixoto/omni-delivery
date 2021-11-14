require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Pedido = require('./models/Pedido');

app.use(express.json());
const urlDB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lc7od.mongodb.net/omni-delivery?retryWrites=true&w=majority`;
const router = express.Router();

// Connect to the MongoDB cluster
mongoose.connect(urlDB)
.then(() => {
  console.log('Conectando ao mongoDB')
    
  app.use(router);
  app.listen(5000, () => console.log (`Omni porta => 5000`))
})
.catch(error => console.error(error));



app.post('/pedido', async(req, res) => {

  const { cnpjRestaurante, cpfCliente} = req.body;
  
  if (!cnpjRestaurante || !cpfCliente) {
    
    res.status(422).json({error: 'Erro, dados insuficientes!'})
  }

  const pedido = {
    cnpjRestaurante: req.body.cnpjRestaurante,
    cpfCliente: req.body.cpfCliente,
    valor: req.body.valor,
    cupomDesconto: req.body.cupomDesconto,
    total: req.body.total,
    enderecoEntrega: req.body.enderecoEntrega,
    cidade: req.body.cidade,
    estado: req.body.estado,
    uf:  req.body.uf,
    cep: req.body.cep,
    dataSolicitacao: req.body.dataSolicitacao,
    prazoEntrega: req.body.prazoEntrega,
    dataFinalizacao: req.body.dataFinalizacao,
    status: req.body.status,  
  }
  console.log('🚀 ~ file: server.js ~ line 39 ~ app.post ~ pedido', pedido)
  
  try {
    
    await Pedido.create(pedido)

    res.status(201).json({message:'Pedido inserido com sucesso!'})

  } catch (err) {
    
    res.status(500).json({error: error})
  }

});