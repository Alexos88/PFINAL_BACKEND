'use strict';
const {
  Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'id_user' });
    }
  }
  Session.init({
    id_user: DataTypes.NUMBER,
    token: DataTypes.STRING,
    expiration: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Session',
  });
  return Session;
};
