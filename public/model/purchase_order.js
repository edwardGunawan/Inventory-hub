const moment = require('moment');
/*
  Purchase_order: discount, totalPrice, customer_id,
  action
*/
module.exports = function(sequelize, DataTypes) {
  let purchaseOrder = sequelize.define('purchase_order', {
    discount: {
      type:DataTypes.FLOAT,
      validate: {
        isFloat:true
      }
    },
    totalPrice: { // current price, so if the table changed then the current price is this
      type:DataTypes.INTEGER,
      allowNull:false,
      validate: {
        isFloat:true
      }
    },
    timestamps: { // this also serve as a receipt number
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: function() {
        return moment().valueOf();
      },
      get : function() { // convert createdAt to timestamps
        return this.getDataValue('timestamps');
      }
    }
  });
  return purchaseOrder;
}
