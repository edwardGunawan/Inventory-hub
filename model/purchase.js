module.exports = function(sequelize, DataTypes) {
  let purchase = sequelize.define('purchase', {
    id: {
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate: {
        isInt:true
      }
    },
    discount: {
      type:DataTypes.FLOAT,
      validate: {
        isFloat:true
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
    price: { // current price, so if the table changed then the current price is this
      type:DataTypes.INTEGER,
      allowNull:false,
      validate: {
        isNumeric:true
      }
    }
  });
  return purchase
}
