const mysql = require('mysql2');
require('dotenv').config();
const env = process.env;

const pool = mysql.createPool({
    host: env.mysql_host,
    user: env.mysql_user,
    password: env.mysql_password,
    port: env.mysql_port,
    database: env.mysql_database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool.promise();