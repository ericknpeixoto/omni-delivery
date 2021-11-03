const express = require ('express');
const app = express();
var mongoose = require("mongoose");
var Pedido = require("./app/models/pedido");
mongoose.connect("mongodb://localhost:27017/UberEats");

app.use(express.json());
var router = express.Router();

router.use(function (req, res, next){
    console.log("Algo está acontecendo aqui...");
    next();
});

router.route("/pedido")
    /* 1) Método: Criar pedido (acessar em: POST http://localhost:4000/pedido)  */
    .post(function(req, res) {
        var pedido = new Pedido();
        pedido.cnpjRestaturante = req.body.cnpjRestaturante;
        pedido.cpfCliente = req.body.cpfCliente;
        pedido.valor = req.body.valor;
        pedido.cupomDesconto = req.body.cupomDesconto;
        pedido.total = req.body.total;
        pedido.enderecoEntrega = req.body.enderecoEntrega;
        pedido.cidade = req.body.cidade;
        pedido.estado = req.body.estado;
        pedido.uf = req.body.uf;
        pedido.cep = req.body.cep;
        pedido.dataSolicitacao = req.body.dataSolicitacao;
        pedido.prazoEntrega = req.body.prazoEntrega;
        pedido.dataFinalizacao = req.body.dataFinalizacao;
        pedido.situacao = req.body.situacao;
        
        pedido.save(function(error) {
            if(error)
                res.send('Erro ao tentar salvar o Pedido....: ' + error);
            
            res.status(201).json({ message: 'Pedido Cadastrado com Sucesso!' });
        });
    })

    /* 2) Método: Selecionar todos pedidos (acessar em: GET http://localhost:4000/pedido)  */
    .get(function(req, res) {
        Pedido.find(function(error, pedidos) {
            if(error) 
                res.send('Erro ao tentar Selecionar Todos os pedidos...: ' + error);

            res.json(pedidos);
        });
    });

//Rotas que irão terminar em '/pedido/:pedido_id':
router.route('/pedido/:pedido_id')

    /* 3) Método: Selecionar por Id: (acessar em: GET http://localhost:4000/pedido/:pedido_id) */
    .get(function (req, res) {
        Pedido.findById(req.params.pedido_id, function(error, pedido) {
            if(error)
                res.send('Id do Pedido não encontrado....: ' + error);

            res.json(pedido);
        });
    })

    /* 4) Método: Atualizar por Id: (acessar em: PUT http://localhost:4000/pedido/:pedido_id) */
    .put(function(req, res) {
        Pedido.findById(req.params.pedido_id, function(error, pedido) {
            if (error) res.send("Id do Pedido não encontrado....: " + error);

            pedido.cnpjRestaturante = req.body.cnpjRestaturante;
            pedido.cpfCliente = req.body.cpfCliente;
            pedido.valor = req.body.valor;
            pedido.cupomDesconto = req.body.cupomDesconto;
            pedido.total = req.body.total;
            pedido.enderecoEntrega = req.body.enderecoEntrega;
            pedido.cidade = req.body.cidade;
            pedido.estado = req.body.estado;
            pedido.uf = req.body.uf;
            pedido.cep = req.body.cep;
            pedido.dataSolicitacao = req.body.dataSolicitacao;
            pedido.prazoEntrega = req.body.prazoEntrega;
            pedido.dataFinalizacao = req.body.dataFinalizacao;
            pedido.situacao = req.body.situacao;

            pedido.save(function(error) {
                if(error)
                    res.send('Erro ao atualizar o pedido....: ' + error);

                res.status(200).json({ message: 'Pedido atualizado com sucesso!' });
            });
        });
    })

    /* 5) Método: Excluir por Id (acessar: http://localhost:4000/pedido/:pedido_id) */
    .delete(function(req, res) {
        
        Pedido.remove({
            _id: req.params.pedido_id
            }, function(error) {
                if (error) res.send("Id do Pedido não encontrado....: " + error);

                res.json({ message: 'Pedido Excluído com Sucesso!' });
            });
    });


app.use(router);

app.listen(4000, () => console.log ("UberEats. Porta 4000."))

