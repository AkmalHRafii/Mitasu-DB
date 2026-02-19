'use strict';
const {
  Model
} = require('sequelize');
const { hashPass } = require('../helpers/bcryptjs');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Bookmark, {foreignKey: "UserId"})
    }
  }
  User.init({
    email: {type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Email must be unique"
      },
      validate: {
        notEmpty: {
          msg: "Email Required"
        },
        notNull: {
          msg: "Email Required"
        },
        isEmail: {
          msg: "Invalid Email Format"
        }
      }
    },
    password: {type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password Required"
        },
        notNull: {
          msg: "Password Required"
        }
      }
    },
    userName: {type: DataTypes.STRING,
      unique: {
        msg: "UserName has beed used"
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate(ins){
        let hash = hashPass(ins.password)
        ins.password = hash
        return hash
      }
    }
  });
  return User;
};