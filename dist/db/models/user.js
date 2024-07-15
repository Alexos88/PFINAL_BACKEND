'use strict';
const {
  Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    
    static associate(models) {
      //this.hasMany(models.Role, { foreignKey: 'id_user' });
      //comentar la linea de abajo si hay problemas
      this.hasMany(models.Session, { foreignKey: 'id_user' });
    }
  }
  User.init({
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    email: DataTypes.STRING,
    cellphone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};