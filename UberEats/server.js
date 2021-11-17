const express = require ('express');
const app = express();
var mongoose = require("mongoose");
var Pedido = require("./app/models/pedido");
// mongoose.connect("mongodb://localhost:27017/UberEats");
mongoose.connect("mongodb+srv://naka:1006@cluster0.lc7od.mongodb.net/uber-eats?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Conectado..."));

app.use(express.json());
var router = express.Router();

router.use(function (req, res, next){
    next();
});


router.route("/pedido")
    /* 1) Método: Criar pedido (acessar em: POST http://localhost:4000/pedido)  */
    .post(function(req, res) {
        let pedido = new Pedido();
        preencherObjetoPedido(pedido, req.body);
        
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
            
            preencherObjetoPedido(pedido, req.body);

            pedido.save(function(error) {
                if(error)
                    res.send('Erro ao atualizar o pedido....: ' + error);

                res.status(200).json({ message: 'Pedido atualizado com sucesso!' });
            });
        });
    })

    /* 5) Método: Excluir por Id (acessar: http://localhost:4000/pedido/:pedido_id) */
    .delete(function(req, res) {
        
        Pedido.deleteOne({
            _id: req.params.pedido_id
            }, function(error) {
                if (error) res.send("Id do Pedido não encontrado....: " + error);

                res.json({ message: 'Pedido Excluído com Sucesso!' });
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
    pedido.dataFinalizacao = body.dataFinalizacao;
    pedido.situacao = body.situacao;
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