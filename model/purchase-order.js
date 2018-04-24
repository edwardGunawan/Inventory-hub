/*
  Purchase_order: discount, totalPrice, customer_id,
  action(in or out)
*/
module.exports = function(sequelize, DataTypes) {
  let purchaseOrder = sequelize.define('purchaseOrder', {
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
        isNumeric:true
      }
    },
    // buying or selling type
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn:[['in','out']]
      }
    },
  });
  return purchaseOrder;
}
