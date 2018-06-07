const moment = require('moment');
module.exports = function(sequelize,DataTypes) {
  var product = sequelize.define('product', {
    code : {
      type: DataTypes.STRING,
      allowNull: false,
      unique:true, // needs to be unique
      validate: {
        notEmpty: true // when initialized cannot be empty
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    brand: {
      type:DataTypes.STRING
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true
      }
    },
    deleted: {
      type:DataTypes.BOOLEAN,
      defaultValue:false
    }
  });
  return product;
}
