// require sequelize and dotenv
const Sequelize = require('sequelize');
require('dotenv').config();
// connection to database
const connection = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT,
        logging: false,
    }
);
// export
module.exports = connection;
