require('dotenv').config();
const express = require('express');
const jwt  = require('jsonwebtoken');
const app = express();
const mongoose = require('mongoose');
const PlataformaPedido = require('./models/PlataformaPedido');
const urlDB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lc7od.mongodb.net/omni-delivery?retryWrites=true&w=majority`;
const SECRET = 'testee'

app.use(express.json());

// Connect to the MongoDB cluster
mongoose.connect(urlDB)
  .then(() => {
    console.log('Conectando ao mongoDB');
      
    app.listen(5000, () => console.log (`Omni porta => 5000`));
  })
  .catch(error => console.error(error));


function verifyJWT(req, res, next) {

  const token = req.headers['x-access-token'];
  
  jwt.verify(token, SECRET, (err, decoded) => {

    if (err) return res.status(401).end();

    next();  
  });
}


//rotas API
app.post('/login', (req, res) => {
  const { user } = req.body;

  if (user == process.env.user) {
    const token = jwt.sign({user}, SECRET, {expiresIn: 300}); // 300 segundos
    return res.json({access_token: token});
  }

  res.status(401).end();
});

app.get('/plataforma/:id', async (req, res) => {

  try {
    const id = req.params.id;
    const plataforma = await PlataformaPedido.findOne({_id: id});
    res.status(200).json(plataforma);
  } catch (err) {
    
    res.status(500).json({error: err});
  }
});

const pedidoRoutes = require('./routes/pedidoRoutes');
app.use('/pedido', verifyJWT, pedidoRoutes, );


