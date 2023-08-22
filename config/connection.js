var mysql = require("mysql");
require('dotenv').config();

//create connection information to sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'employee_db'
});

module.exports = connection;