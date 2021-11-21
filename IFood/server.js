const express = require('express')
const mysql = require('mysql2')
const axios = require('axios')
require('dotenv').config()
const env = process.env

/**
 * Configuração do App
 */
const app = express()
app.use(express.json())

app.listen(3000, () =>
  console.log('Executando o serviço "ifood" na Porta 3000.')
)

/**
 * Configuração da conexão com o MySQL
 */

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

const poolPromise = pool.promise();

/**
 * Rota para a listagem de todos os pedidos
 */
app.get('/pedido', async (req, res) => {
  const sqlQuery = 'SELECT * FROM tb_pedido'
  const [rows] = await poolPromise.query(sqlQuery)
  res.status(200).json(rows)
})

/**
 * Rota para cadastro do pedido
 */
app.post('/pedido', async (req, res) => {
  //Cria um objeto JSON com os dados do pedido
  const pedido = preencherObjetoPedido(req.body)

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
            custoFinal,
            horaPedido
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

  const [result] = await poolPromise.query(sqlQuery, [
    pedido.cnpj,
    pedido.cpf,
    pedido.logradouro,
    pedido.numeroEndereco,
    pedido.complementoEndereco,
    pedido.bairro,
    pedido.cidade,
    pedido.uf,
    pedido.cep,
    pedido.custo,
    pedido.frete,
    pedido.desconto,
    pedido.custoFinal,
    dataAtual()
  ]);

  //Cadastro dos itens do pedido
  await cadastrarItensDoPedido(result.insertId, pedido.itensPedido);

  //Envio do JSON do novo pedido para o solicitante
  const [novoPedido] = await poolPromise.query(
    `SELECT * FROM tb_pedido WHERE idPedido = ${result.insertId}`
  );
  res.status(201).json(novoPedido[0]);

  //Obtem a URL de serviço de gestão cadastrado pelo restaurante
  const [urls] = await poolPromise.query(
    `SELECT urlOpenDelivery FROM tb_restaurante r WHERE r.cnpj = ?`,
    [novoPedido[0].cnpj]
  );

  //Envio do Pedido criado para o Omni
  const pedidoOmni = {
    idPlataforma: '619207019ead91a88608cf48',
    idPedido: `${result.insertId}`,
    custo: novoPedido[0].custo,
    desconto: novoPedido[0].desconto,
    frete: novoPedido[0].frete,
    total: novoPedido[0].custoFinal,
    data: novoPedido[0].horaPedido,
    status: 0
  }

  await axios.post(`${urls[0].urlOpenDelivery}`, pedidoOmni);
});

/**
 * Rota para atualização dos dados do pedido
 */
app.put('/pedido/:idPedido', async (req, res) => {
  const idPedido = req.params.idPedido;
  const pedido = preencherObjetoPedido(req.body);
  const {
    cnpj,
    cpf,
    logradouro,
    numeroEndereco,
    complementoEndereco,
    bairro,
    cidade,
    uf,
    cep,
    itensPedido,
    custo,
    frete,
    desconto,
    custoFinal
  } = pedido;

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
    `;

  await poolPromise.query(sqlQuery, [
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
    custoFinal,
    idPedido
  ]);

  await atualizarItensDoPedido(idPedido, itensPedido);

  const [pedidoAtualizado] = await poolPromise.query(
    `SELECT * FROM tb_pedido WHERE idPedido = ${idPedido}`
  );
  res.status(200).json(pedidoAtualizado[0]);
});

/**
 * Rota para atualização do status do pedido
 */
app.put('/pedido/:idPedido/:status', async (req, res) => {
  const idPedido = req.params.idPedido;
  const status = req.params.status;

  let sqlQuery;
  let parametros = [status, dataAtual(), idPedido];

  switch (status) {
    case '2':
      sqlQuery = `UPDATE tb_pedido SET statusPedido = ?, horaSaida = ? WHERE idPedido = ?`;
      break;

    case '3':
      sqlQuery = `UPDATE tb_pedido SET statusPedido = ?, horaEntrega = ? WHERE idPedido = ?`;
      break;

    default:
      sqlQuery = `UPDATE tb_pedido SET statusPedido = ? WHERE idPedido = ?`;
      parametros = [status, idPedido];
  }

  await poolPromise.query(sqlQuery, parametros);

  const [pedidoAtualizado] = await poolPromise.query(
    `SELECT * FROM tb_pedido WHERE idPedido = ${idPedido}`
  );
  res.status(200).json(pedidoAtualizado[0]);

  const [urls] = await poolPromise.query(
    `SELECT urlOpenDelivery FROM tb_restaurante r WHERE r.cnpj = ?`,
    [pedidoAtualizado[0].cnpj]
  );

  const pedidoOmni = {
    idPlataforma: '619207019ead91a88608cf48',
    idPedido: pedidoAtualizado[0].idPedido,
    status: pedidoAtualizado[0].statusPedido
  }

  await axios.post(`${urls[0].urlOpenDelivery}/status`, pedidoOmni)
});

/**
 * Rota consulta do status do pedido
 */
app.get('/pedido/:idPedido', async (req, res) => {
  const idPedido = req.params.idPedido;

  const sqlQuery = `SELECT * FROM tb_pedido WHERE idPedido = ?`;
  const [resultado] = await poolPromise.query(sqlQuery, [idPedido]);

  const [itensPedido] = await poolPromise.query(
    'SELECT * FROM tb_itemPedido WHERE idPedido = ?',
    [idPedido]
  );

  let pedido = resultado[0]
  pedido['itens'] = itensPedido
  res.status(200).json(resultado[0]);
});

/**
 * Rota para excluir o pedido
 */
app.delete('/pedido/:idPedido', async (req, res) => {
  const idPedido = req.params.idPedido;

  const sqlQuery = 'DELETE FROM tb_pedido WHERE idPedido = ?';
  const [result] = await poolPromise.query(sqlQuery, [idPedido]);
  result.affectedRows > 0
    ? res.status(200).json(result)
    : res.status(200).send('Pedido não encontrado.');
});

/**
 * Realiza o cadastro de cada item do pedido no banco de dados
 */
function cadastrarItensDoPedido(idPedido, itensPedido) {
  itensPedido.map(async (item) => {
    let { idItem, quantidade, precoUnitario } = item;
    let subtotal = quantidade * precoUnitario;

    const sqlQuery = `
              INSERT INTO 
              tb_itemPedido (idItem, idPedido, quantidade, precoUnitario, subTotal)
              VALUES (?, ?, ?, ?, ?)
          `;
    await poolPromise.query(sqlQuery, [
      idItem,
      idPedido,
      quantidade,
      precoUnitario,
      subtotal
    ]);
  });
}

/**
 * Atualiza os dados dos itens do pedido no banco de dados
 */
function atualizarItensDoPedido(idPedido, itensPedido) {
  itensPedido.map(async (item) => {
    let { idItem, quantidade, precoUnitario } = item;
    let subtotal = quantidade * precoUnitario;

    const sqlQuery = `
              UPDATE tb_itemPedido SET 
                  quantidade = ?,
                  precoUnitario = ?, 
                  subTotal = ?
              WHERE idItem = ? AND idPedido = ?
          `;
    await poolPromise.query(sqlQuery, [
      quantidade,
      precoUnitario,
      subtotal,
      idItem,
      idPedido
    ]);
  });
}

/**
 * Preenche o objeto pedido antes de cadastrar ou alterar no banco de dados
 */
function preencherObjetoPedido(body) {
  //Calcula o custo dos itens selecionados (sem desconto e frete)
  const custo = calcularCusto(body.itens);
  //Calcula o custo final do pedido, incluindo frete e descontos
  const custoFinal = (
    custo +
    parseInt(body.frete) -
    parseInt(body.desconto)
  ).toFixed(2);

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
  };
}

/**
 * Calcula e retorna o custo do pedido com base nos itens selecionados
 */
function calcularCusto(itensPedido) {
  let custo = 0;
  itensPedido.map((item) => {
    custo += item.quantidade * item.precoUnitario;
  });

  return custo;
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
