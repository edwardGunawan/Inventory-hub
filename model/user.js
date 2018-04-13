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
    salt_admin: {
      type: DataTypes.STRING
    },
    password_hash_admin: {
      type: DataTypes.STRING
    },
    admin_password: {
      type:DataTypes.VIRTUAL,
      allowNull:false,
      validate:{
        len:[7,100]
      },
      set: function (val) {
        // value is password
        // bcrypt salt
        let salt = bcrypt.genSaltSync(10);
        // bcrypt hash
        let hash = bcrypt.hashSync(val,salt);
        // set dataValue for password salt and hash
        this.setDataValue('salt_admin', salt);
        this.setDataValue('password_hash_admin', hash);
        this.setDataValue('admin_password', val);
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
    salt_public: {
      type:DataTypes.STRING
    },
    hash_public: {
      type:DataTypes.STRING
    },
    public_password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        notEmpty: true,
        len:[7,100]
      },
      set: function(value) {
        // salt password for public and
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(value,salt);

        this.setDataValue('salt_public', salt);
        this.setDataValue('hash_public', hash);
        this.setDataValue('public_password', value);
      }
    }
  });

  // class method for bcrypt hash and compare them to check if
  // the value does exist
  // TODO: need to set whether it is a public or an admin account
  User.authenticate = (body) => {

  }

  return User;

}
