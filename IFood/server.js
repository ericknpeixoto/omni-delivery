const express = require ('express')
const mysql = require('mysql2')
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

app.post('/pedido', async (req, res) => {
    const pedido = preencherObjetoPedido(req.body)
    
    const { cnpj, cpf, logradouro, numeroEndereco, complementoEndereco, bairro, cidade, uf, cep} = pedido

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
            cep
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const [result] = await poolPromise.query(sqlQuery, [cnpj, cpf, logradouro, numeroEndereco, complementoEndereco, bairro, cidade, uf, cep])
    const [novoPedido] = await poolPromise.query(`SELECT * FROM tb_pedido WHERE idPedido = ${result.insertId}`)
    res.status(201).json(novoPedido)
})

app.put('/pedido/:idPedido', async (req, res) => {
    const idPedido = req.params.idPedido
    const pedido = preencherObjetoPedido(req.body)
    const { cnpj, cpf, logradouro, numeroEndereco, complementoEndereco, bairro, cidade, uf, cep} = pedido

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
            cep = ?
        WHERE idPedido = ?
    `
    
    const [result] = await poolPromise.query(sqlQuery, [cnpj, cpf, logradouro, numeroEndereco, complementoEndereco, bairro, cidade, uf, cep, idPedido])
    const [pedidoAtualizado] = await poolPromise.query(`SELECT * FROM tb_pedido WHERE idPedido = ${idPedido}`)
    res.status(200).json(pedidoAtualizado)
})

app.delete('/pedido/:idPedido', async (req, res) => {
    const idPedido = req.params.idPedido
    
    const sqlQuery = 'DELETE FROM tb_pedido WHERE idPedido = ?'
    const [result] = await poolPromise.query(sqlQuery, [idPedido])
    result.affectedRows > 0 ? res.status(200).json(result) : res.status(200).send("Este pedido não existe.")
})

function preencherObjetoPedido(body){
    return {
        cnpj: body.cnpj,
        cpf: body.cpf,
        logradouro: body.logradouro,
        numeroEndereco: body.numeroEndereco,
        complementoEndereco: body.complementoEndereco,
        bairro: body.bairro,
        cidade: body.cidade,
        uf: body.uf,
        cep: body.cep
    }
}