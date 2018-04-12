module.exports = function(sequelize,DataTypes){
  var User =  sequelize.define('user', {
    email:{
      type:DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail:true
      }
    },
    admin_username: {
      type:DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty:true,
        len:[2,7]
      }
    },
    // salt: {
    //   type: DataTypes.STRING
    // },
    // password_hash: {
    //   type: DataTypes.STRING
    // },
    admin_password: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        len:[7,100]
      }
    },
    public_username: {
      type:DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate:{
        notEmpty:true,
        len:[2,7]
      }
    },
    public_password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len:[7,100]
      }
    }
  });

  return User;

}
