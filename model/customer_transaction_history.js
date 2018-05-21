const moment = require('moment');
// Customer Transaction will have CustomerId, ActionId as a junction table
module.exports = function(sequelize,DataTypes) {
  let customerTransactionHistory = sequelize.define('customer_transaction', {
    id:{
      type:DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true
    },
    timestamps: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: function() {
        // console.log('go through moment value of ', moment().valueOf());
        return moment().valueOf();
      },
      get : function() { // convert createdAt to timestamps
        return this.getDataValue('timestamps');
      }
    }
  });

  return customerTransactionHistory;
}
