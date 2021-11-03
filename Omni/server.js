const express = require ('express');
const app = express();
const mysql = require('mysql2');

app.use(express.json());
app.listen(5000, () => console.log ("Omni porta 5000."))



