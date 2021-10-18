const express = require ('express')
const app = express()
app.use(express.json())


let contador = 3
let pedidos = [
    {
        idPedido: 1,
        cnpjRestaturante: '11.939.409/0001-94',
        cpfCliente: '515.539.680-85',
        custo: 90.00,
        desconto: 15.00,
        total: 75.00,
        dataInicio: '2021-10-15T08:05:00Z',
        dataEntrega: '2021-10-15T09:00:00Z',
        dataFim: '2021-10-15T09:05:00Z',
        status: 'Entregue',
        logradouro: 'Rua das Ruas',
        numero: '14',
        complemento: '',
        cidade: 'São Paulo',
        estado: 'São Paulo',
        uf: 'SP',
        cep: '03928232',
    },
    {
        idPedido: 2,
        cnpjRestaturante: '39.169.871/0001-79',
        cpfCliente: '493.591.420-34',
        custo: 50.00,
        desconto: 5.00,
        total: 45.00,
        dataInicio: '2021-10-16T19:15:00Z',
        dataEntrega: '2021-10-16T20:05:00Z',
        dataFim: '2021-10-16T20:010:00Z',
        status: 'Entregue',
        logradouro: 'Rua das Ruas',
        numero: '14',
        complemento: '',
        cidade: 'São Paulo',
        estado: 'São Paulo',
        uf: 'SP',
        cep: '03928232',
    }
]

app.post('/pedido', (req, res) => {
    let pedido = preencherObjetoPedido(contador++, req.body)
    pedidos.push(pedido)
    res.status(201).json(pedidos)
})

app.get('/pedido', (req, res) => {
    res.json(pedidos)
})


app.put('/pedido/:idPedido', (req, res) => {
    let idPedido = req.params.idPedido
    let indice = pedidos.findIndex(pedido => pedido.idPedido == idPedido)
    let pedido = preencherObjetoPedido(idPedido, req.body)

    pedidos[indice] = pedido

    res.status(200).json(pedidos)
})

app.delete('/pedido/:idPedido', (req, res) => {
    let idPedido = req.params.idPedido
    let indice = pedidos.findIndex(pedido => pedido.idPedido == idPedido)
    if (indice == -1) {
        res.status(204)
    }

    pedidos.splice(indice, 1)
    res.status(200).json(pedidos)
})

function preencherObjetoPedido(idPedido, body){
    return {
        idPedido: idPedido,
        cnpjRestaturante: body.cnpjRestaturante,
        cpfCliente: body.cpfCliente,
        custo: body.custo,
        desconto: body.desconto,
        total: body.total,
        dataInicio: body.dataInicio,
        dataEntrega: body.dataEntrega,
        dataFim: body.dataFim,
        status: body.status,
        logradouro: body.logradouro,
        numero: body.numero,
        complemento: body.complemento,
        cidade: body.cidade,
        estado: body.estado,
        uf: body.uf,
        cep: body.cep
    }
} 



app.listen(3000, () => console.log ("Classificação. Porta 3000."))
