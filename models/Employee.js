const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Employee extends Model {}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'role',
        key: 'id',
      },
    },
    manager_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'employee',
        key: 'id',
      },
      allowNull: true
    },
  },
  {
    sequelize,
    timestamps: false,
    // freezeTableName: true,
    underscored: true,
    modelName: 'employee',
  }
);

module.exports = Employee;