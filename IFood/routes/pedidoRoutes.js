const router = require('express').Router();
const axios = require('axios');

const Pedido = require('../models/Pedido.js');
const poolPromise = require('../models/ConexaoBancoFactory.js');

router.route('/').get(async (req, res) => {
    const sqlQuery = 'SELECT * FROM tb_pedido';
    const [rows] = await poolPromise.query(sqlQuery);
    res.status(200).json(rows);
});

router.route('/').post(async (req, res) => {
    const pedido = new Pedido(req.body).getDados();

    //Cadastro do Pedido no MySQL
    const sqlQuery = `
        INSERT INTO tb_pedido 
        (cnpj, cpf, logradouro, numeroEndereco, complementoEndereco, bairro, cidade, uf, cep, custo, frete, desconto, custoFinal, horaPedido) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

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
        dataAtual(),
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
        status: 0, //Pedido Pendente de confirmação
    };

    await axios.post(`${urls[0].urlOpenDelivery}`, pedidoOmni);
});

router.route('/:idPedido').get(async (req, res) => {
    const idPedido = req.params.idPedido;

    const sqlQuery = `SELECT * FROM tb_pedido WHERE idPedido = ?`;
    const [resultado] = await poolPromise.query(sqlQuery, [idPedido]);

    const [itensPedido] = await poolPromise.query(
        'SELECT * FROM tb_itemPedido WHERE idPedido = ?',
        [idPedido]
    );

    let pedido = resultado[0];
    pedido['itens'] = itensPedido;
    res.status(200).json(resultado[0]);

})

router.route('/:idPedido').put(async (req, res) => {
    const idPedido = req.params.idPedido;

    const pedido = new Pedido(req.body).getDados();

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
        idPedido,
    ]);

    await atualizarItensDoPedido(idPedido, pedido.itensPedido);

    const [pedidoAtualizado] = await poolPromise.query(
        `SELECT * FROM tb_pedido WHERE idPedido = ${idPedido}`
    );
    res.status(200).json(pedidoAtualizado[0]);
});

router.route('/:idPedido').delete(async (req, res) => {
    const idPedido = req.params.idPedido;

    const sqlQuery = 'DELETE FROM tb_pedido WHERE idPedido = ?';
    const [result] = await poolPromise.query(sqlQuery, [idPedido]);

    result.affectedRows > 0
        ? res.status(200).json(result)
        : res.status(200).send('Pedido não encontrado.');
});

/**
 * Rota atualização do status do pedido
 */

router.route('/:idPedido/:status').post(async (req, res) => {
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
});



/**
 * Funções
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
            subtotal,
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
            idPedido,
        ]);
    });
}

module.exports = router;
