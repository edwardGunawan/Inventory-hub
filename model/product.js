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
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    brand: {
      type:DataTypes.STRING
    },
    // type : stock or return
    // type: {
    //   type: DataTypes.STRING,
    //   validate: {
    //     isAlpha: true
    //   }
    // },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true
      }
    }
  });
  return product;
}
