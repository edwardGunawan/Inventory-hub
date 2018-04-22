module.exports = function(sequelize, DataTypes) {
  let customer = sequelize.define('customer', {
    name: {
      type: DataTypes.STRING,
      allowNull:false,
      isUnique:true
    }
  });
  return customer;
}
