const moment = require('moment');
/*
  Purchase Detail:
    product_id, totalQuantity, purchase_order_id, totalPricePerItem,
    pricePerItem
*/
module.exports = function(sequelize, DataTypes) {
  let purchaseDetail = sequelize.define('purchase-detail', {
    id: {
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate: {
        isInt:true
      }
    },
    pricePerItem: {
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        isNumeric:true
      }
    },
    totalPricePerItem: {
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        isNumeric:true
      }
    },
    timestamps: {
      type: DataTypes.BIGINT,
      defaultValue: moment().valueOf(),
      allowNull:false,
      get: function() {
        return this.getDataValue('timestamps');
      }
    }
  });
  return purchaseDetail;
}
