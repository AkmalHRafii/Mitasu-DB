'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mywork extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Mywork.belongsTo(models.User, { foreignKey: 'UserId' });
    }
  }
  Mywork.init({
    title: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
    UserId: {
      type: DataTypes.INTEGER, allowNull: false,
      references: {
        model: `User`,
        key: `id`
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Mywork',
  });
  return Mywork;
};