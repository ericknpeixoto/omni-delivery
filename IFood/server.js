const express = require ('express')
const mysql = require('mysql2')
const axios = require('axios')
require('dotenv').config()

const env = process.env

//Configuração do App
const app = express()
app.use(express.json())
app.listen(3000, () => console.log ("ifood. Porta 3000."))

//Configuração da conexão com MySQL
const pool = mysql.createPool({
    host: env.mysql_host,
    user: env.mysql_user,
    password: env.mysql_password,
    port: env.mysql_port,
    database: env.mysql_database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})
const poolPromise = pool.promise()

//Rotas de Pedidos
app.get('/pedido', async (req, res) => {
    const sqlQuery = 'SELECT * FROM tb_pedido'
    const [ rows ] = await poolPromise.query(sqlQuery)
    res.status(200).json(rows)
})

/**
 * Rota para cadastro do pedido
 */
app.post('/pedido', async (req, res) => {
    const pedido = preencherObjetoPedido(req.body)
    const { cnpj, cpf, logradouro, numeroEndereco, complementoEndereco, bairro, cidade, uf, cep, itensPedido, custo, frete, desconto, custoFinal} = pedido
    
    //Cadastro do Pedido no MySQL
    const sqlQuery = `
        INSERT INTO tb_pedido (
            cnpj, 
            cpf, 
            logradouro, 
            numeroEndereco, 
            complementoEndereco, 
            bairro, 
            cidade, 
            uf, 
            cep,
            custo,
            frete,
            desconto,
            custoFinal
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const [result] = await poolPromise.query(sqlQuery, [cnpj, cpf, logradouro, numeroEndereco, complementoEndereco, bairro, cidade, uf, cep, custo, frete, desconto, custoFinal])
    
    //Cadastro dos itens do pedido
    await cadastrarItensDoPedido(result.insertId, itensPedido)

    //Envio do JSON do novo pedido para o solicitante
    const [novoPedido] = await poolPromise.query(`SELECT * FROM tb_pedido WHERE idPedido = ${result.insertId}`)
    res.status(201).json(novoPedido[0])

    //Envio do Pedido criado para o Omni
    const pedidoOmni = {
        idPlataforma: '619207019ead91a88608cf48',
        idPedido: `${result.insertId}`,
        custo: novoPedido[0].custo,
        desconto: novoPedido[0].desconto,
        frete: novoPedido[0].frete,
        total: novoPedido[0].custoFinal,
        data: Date.now(),
        status: 0
    }

    axios.post('http://localhost:5000/pedido', pedidoOmni)
})

/**
 * Rota para atualização dos dados do pedido
 */
app.put('/pedido/:idPedido', async (req, res) => {
    const idPedido = req.params.idPedido
    const pedido = preencherObjetoPedido(req.body)
    const { cnpj, cpf, logradouro, numeroEndereco, complementoEndereco, bairro, cidade, uf, cep, itensPedido, custo, frete, desconto, custoFinal} = pedido

    const sqlQuery = `
        UPDATE tb_pedido SET
            cnpj = ?,
            cpf = ?,
            logradouro = ?,
            numeroEndereco = ?,
            complementoEndereco = ?,
            bairro = ?,
            cidade = ?,
            uf = ?,
            cep = ?,
            custo = ?,
            frete = ?,
            desconto = ?,
            custoFinal = ?
        WHERE idPedido = ?
    `
    
    await poolPromise.query(sqlQuery, [cnpj, cpf, logradouro, numeroEndereco, complementoEndereco, bairro, cidade, uf, cep, custo, frete, desconto, custoFinal, idPedido])
    
    await atualizarItensDoPedido(idPedido, itensPedido)

    const [pedidoAtualizado] = await poolPromise.query(`SELECT * FROM tb_pedido WHERE idPedido = ${idPedido}`)
    res.status(200).json(pedidoAtualizado[0])
})

/**
 * Rota para atualização do status do pedido
 */
app.put('/pedido/:idPedido/:status', async (req, res) => {
    const idPedido = req.params.idPedido
    const status = req.params.status

    const sqlQuery = `UPDATE tb_pedido SET statusPedido = ? WHERE idPedido = ?`
    
    await poolPromise.query(sqlQuery, [status, idPedido])
    
    const [pedidoAtualizado] = await poolPromise.query(`SELECT * FROM tb_pedido WHERE idPedido = ${idPedido}`)
    res.status(200).json(pedidoAtualizado[0])
})

/**
 * Rota consulta do status do pedido
 */
 app.get('/pedido/:idPedido', async (req, res) => {
    const idPedido = req.params.idPedido

    const sqlQuery = `SELECT * FROM tb_pedido WHERE idPedido = ?`
    const [resultado] = await poolPromise.query(sqlQuery, [idPedido])
    
    res.status(200).json(resultado[0])
})

/**
 * Rota para excluir o pedido
 */
app.delete('/pedido/:idPedido', async (req, res) => {
    const idPedido = req.params.idPedido
    
    const sqlQuery = 'DELETE FROM tb_pedido WHERE idPedido = ?'
    const [result] = await poolPromise.query(sqlQuery, [idPedido])
    result.affectedRows > 0 ? res.status(200).json(result) : res.status(200).send("Este pedido não existe.")
})

/**
 * Preenche o objeto pedido antes de cadastrar ou alterar no banco de dados
 */
function preencherObjetoPedido(body){
    const custo = calcularCusto(body.itens)
    const custoFinal = (custo + parseInt(body.frete) - parseInt(body.desconto)).toFixed(2)

    return {
        cnpj: body.cnpj,
        cpf: body.cpf,
        logradouro: body.logradouro,
        numeroEndereco: body.numeroEndereco,
        complementoEndereco: body.complementoEndereco,
        bairro: body.bairro,
        cidade: body.cidade,
        uf: body.uf,
        cep: body.cep,
        itensPedido: body.itens,
        custo: custo,
        frete: body.frete,
        desconto: body.desconto,
        custoFinal: custoFinal
    }
}

/**
 * Realiza o cadastro de cada item do pedido no banco de dados
 */
function cadastrarItensDoPedido (idPedido, itensPedido) {
    itensPedido.map(async item => {
        let { idItem, quantidade, precoUnitario } = item
        let subtotal = quantidade * precoUnitario

        const sqlQuery = `
            INSERT INTO 
            tb_itemPedido (idItem, idPedido, quantidade, precoUnitario, subTotal)
            VALUES (?, ?, ?, ?, ?)
        `
        await poolPromise.query(sqlQuery, [idItem, idPedido, quantidade, precoUnitario, subtotal])
    })
}

/**
 * Atualiza os dados dos itens do pedido no banco de dados
 */
function atualizarItensDoPedido(idPedido, itensPedido) {
    itensPedido.map(async item => {
        let { idItem, quantidade, precoUnitario } = item
        let subtotal = quantidade * precoUnitario
        
        const sqlQuery = `
            UPDATE tb_itemPedido SET 
                quantidade = ?,
                precoUnitario = ?, 
                subTotal = ?
            WHERE idItem = ? AND idPedido = ?
        `
        await poolPromise.query(sqlQuery, [quantidade, precoUnitario, subtotal, idItem, idPedido])
    })
}

/**
 * Calcula e retorna o custo do pedido com base nos itens selecionados
 */
function calcularCusto(itensPedido) {
    let custo = 0
    itensPedido.map(item => {
        custo += (item.quantidade * item.precoUnitario)
    })

    return custo
}