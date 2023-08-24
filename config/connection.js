const sequelize = require('sequelize');
require('dotenv').config();

//create connection information to sql database
const connection = new sequelize(
    'employee_tracker_db',
    'root',
    'Free1211!',
    {
        host: 'localhost',
        dialect: 'mysql',
        port: 3306,
        logging: false,
    }
);

module.exports = connection;