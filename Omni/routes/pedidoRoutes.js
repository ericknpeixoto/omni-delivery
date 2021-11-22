const router = require('express').Router();
const Pedido = require('../models/Pedido');
const PlataformaPedido = require('../models/PlataformaPedido');
const functions = require('../utils/functions');
const axios = require('axios');

router.post('/', async (req, res) => {
  
  const { idPlataforma, idPedido} = req.body;
  
  if (!idPlataforma || !idPedido) {
    
    res.status(422).json({error: 'Erro, dados insuficientes!'});
    return;
  }
  
  const pedido = {
    idPlataforma,
    idPedido,
    custo: req.body.custo,
    desconto: req.body.desconto,
    frete: req.body.frete,
    total: req.body.total,
    data: req.body.data, 
    status: req.body.status,
  };
  
  try {
    
    await Pedido.create(pedido);
    res.status(201).json({message:'Pedido inserido com sucesso!'});
    
  } catch (err) {
    
    res.status(500).json({error: err});
  }
  
});


router.post('/status', async (req, res) => {

  const { idPlataforma, idPedido, status } = req.body;

  if (!idPlataforma || !idPedido || !status) {
    
    res.status(422).json({error: 'Erro, dados insuficiente!'});
    return;
  }

  try {

    const filter = { idPlataforma: idPlataforma, idPedido: idPedido };
    await Pedido.updateOne(filter, { status: status });

    res.json({message:'Status de pedido atualizado com sucesso!'});;
    
  } catch (error) {
    res.status(500).json({error: err});
  }

});

router.get('/:idPlataforma/:idPedido', async (req, res) => {
  
  try {
    const {idPlataforma, idPedido} = req.params;
    const pedido = await Pedido.findOne({ idPlataforma: idPlataforma, idPedido: idPedido });
    const plataforma = await PlataformaPedido.findOne({_id: idPlataforma});
    
    const resp = {
      plataforma: plataforma.nome,
      idPedido: pedido.idPedido,
      custo: pedido.custo,
      desconto: pedido.desconto,
      frete: pedido.frete,
      total: pedido.total,
      data: pedido.data,
      status: functions.statusPedidoPipe(pedido.status)
    }
    res.status(200).json(resp);
    
  } catch (err) {
    
    res.status(500).json({error: err});
  }
});

router.get('/detalhe/:idPlataforma/:idPedido', async (req, res) => {

  try {
    const {idPlataforma, idPedido} = req.params;

    const urlPlataforma  = await PlataformaPedido.findOne({ _id: idPlataforma}).select('url'); 
    const url = `${urlPlataforma.url}/pedido/${idPedido}`

    axios.get(url).then(resp => {
      
      const pedido = resp.data;
      res.json(pedido);

    }).catch(error => {
      console.error(error.toJSON());
    });
    

  } catch (error) {
    res.status(500).json({error: err});
  }
});



module.exports = router;