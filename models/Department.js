// require sequelize
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
// model definition
class Department extends Model {}

Department.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    underscored: true,
    modelName: 'department',
  }
);
// export
module.exports = Department;
