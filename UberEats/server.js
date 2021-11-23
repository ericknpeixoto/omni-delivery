require('dotenv').config();
const express = require ('express');
const app = express();
const axios = require('axios');
var mongoose = require("mongoose");
var Pedido = require("./app/models/pedido");

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lc7od.mongodb.net/uber-eats?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));

app.use(express.json());
var router = express.Router();

router.use(function (req, res, next){
    next();
});


router.route("/pedido")
    /* Criar pedido (acessar em: POST http://localhost:4000/pedido)  */
    .post(function(req, res) {
        let pedido = new Pedido();
        preencherObjetoPedido(pedido, req.body);
        
        pedido.save(function(error, room) {
            if(error) res.send('Erro ao tentar salvar o Pedido....: ' + error);
            
            res.status(201).json({ message: 'Pedido Cadastrado com Sucesso!' });
            enviarPedidoParaOmniDelivery(room._id, pedido);
        });
    })

    /* Selecionar todos pedidos (acessar em: GET http://localhost:4000/pedido)  */
    .get(function(req, res) {
        Pedido.find(function(error, pedidos) {
            if(error) 
                res.send('Erro ao tentar Selecionar Todos os pedidos...: ' + error);

            res.json(pedidos);
        });
    });

//Rotas que irão terminar em '/pedido/:pedido_id':
router.route('/pedido/:pedido_id')
    /* Selecionar por Id: (acessar em: GET http://localhost:4000/pedido/:pedido_id) */
    .get(function (req, res) {
        Pedido.findById(req.params.pedido_id, function(error, pedido) {
            if(error)
                res.send('Id do Pedido não encontrado....: ' + error);

            res.json(pedido);
        });
    })

    /* Atualizar por Id: (acessar em: PUT http://localhost:4000/pedido/:pedido_id) */
    .put(function(req, res) {
        Pedido.findById(req.params.pedido_id, function(error, pedido) {
            if (error) res.send("Id do Pedido não encontrado....: " + error);
            
            preencherObjetoPedido(pedido, req.body);

            pedido.save(function(error) {
                if(error)
                    res.send('Erro ao atualizar o pedido....: ' + error);

                res.status(200).json({ message: 'Pedido atualizado com sucesso!' });
            });
        });
    })

    /* Excluir por Id (acessar: DELETE http://localhost:4000/pedido/:pedido_id) */
    .delete(function(req, res) {
        
        Pedido.deleteOne({
            _id: req.params.pedido_id
            }, function(error) {
                if (error) res.send("Id do Pedido não encontrado....: " + error);

                res.json({ message: 'Pedido Excluído com Sucesso!' });
            });
    });

router.route('/pedido/:pedido_id/:status')
    /* Rota para atualização do status do pedido: (acessar em: POST http://localhost:4000/pedido/:pedido_id/:status) */
    .post(function(req, res) {
        let idPedido = req.params.pedido_id;
        Pedido.findById(idPedido, function(error, pedido) {
            if (error) res.send("Pedido não encontrado....: " + error);
            
            let status = req.params.status;
            pedido.statusPedido = status;

            switch (status) {
                case '2':
                    pedido.dataSaida = dataAtual();
                  break;
                case '3':
                    pedido.dataFinalizacao =  dataAtual();
                break;
            }

            pedido.save(function(error) {
                if(error)
                    res.send('Erro ao atualizar o pedido....: ' + error);

                res.status(200).json({ message: 'Pedido atualizado com sucesso!' });
            });
        });
    });


app.use(router);

app.listen(4000, () => console.log ("UberEats. Porta 4000."))


function preencherObjetoPedido(pedido, body){
    let custo = calcularCusto(body.itens);
    let custoFinal = custo + parseInt(body.frete) - parseInt(body.cupomDesconto);

    pedido.cnpjRestaturante = body.cnpjRestaturante;
    pedido.cpfCliente = body.cpfCliente;
    pedido.frete = body.frete;
    pedido.cupomDesconto = body.cupomDesconto;
    pedido.enderecoEntrega = body.enderecoEntrega;
    pedido.cidade = body.cidade;
    pedido.estado = body.estado;
    pedido.uf = body.uf;
    pedido.cep = body.cep;
    pedido.dataSolicitacao = body.dataSolicitacao;
    pedido.prazoEntrega = body.prazoEntrega;
    pedido.dataSaida = body.dataSaida;
    pedido.dataFinalizacao = body.dataFinalizacao;
    pedido.statusPedido = body.statusPedido;
    pedido.custoItens = custo;
    pedido.total = custoFinal;
    pedido.itens = [];
    body.itens.map(async item => {
        pedido.itens.push(item);
    });
}

function calcularCusto(itensPedido) {
    return itensPedido.reduce(function(anteriores, atual) {
        return anteriores + (atual.quantidade * atual.preco);
      }, 0);
}

async function enviarPedidoParaOmniDelivery(pedido_id, pedido){
    const pedidoOmni = {
        idPlataforma: '6191ea688ede35b5ccc7ec54',
        idPedido: pedido_id,
        custo: pedido.custoItens,
        desconto: pedido.cupomDesconto,
        frete: pedido.frete,
        total: pedido.total,
        data: pedido.dataSolicitacao,
        status: 0
    };

    await axios.post(`http://localhost:5000/pedido`, pedidoOmni);
}


/**
 * Obtem e retorna a data atual em formato UTC
 */
 function dataAtual() {
    let data = new Date();
    return new Date(
      Date.UTC(
        data.getFullYear(),
        data.getMonth(),
        data.getDate(),
        data.getHours(),
        data.getMinutes(),
        data.getSeconds()
      )
    );
  }
  