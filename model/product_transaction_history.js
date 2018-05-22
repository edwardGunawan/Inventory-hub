const moment = require('moment');
module.exports = function(sequelize,DataTypes) {
  let productTransactionHistory = sequelize.define('product_transaction_history', {
    id: {
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    timestamps: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: function() {
        console.log('go through defaultValue',moment().valueOf());
        return moment().valueOf();
      },
      get : function() { // convert createdAt to timestamps
        return this.getDataValue('timestamps');
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    code : {
      type: DataTypes.STRING,
      allowNull: false,
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
    }
  });
  return productTransactionHistory;
}
