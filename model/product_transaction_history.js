const moment = require('moment');
module.exports = function(sequelize,DataTypes) {
  let productTransactionHistory = sequelize.define('product_transaction_history', {
    timestamps: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: function() {
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
    }
  });
  return productTransactionHistory;
}
