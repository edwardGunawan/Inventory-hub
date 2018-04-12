module.exports = function(sequelize,DataTypes) {
  var product = sequelize.define('product', {
    code : {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    out: {
      type:DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true
      }
    },
    // type : stock or return
    type: {
      type: DataTypes.STRING,
      validate: {
        isAlpha: true
      }
    },
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
