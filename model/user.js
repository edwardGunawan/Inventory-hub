let bcrypt = require('bcryptjs');
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
    // admin_username: {
    //   type:DataTypes.STRING,
    //   allowNull: false,
    //   validate: {
    //     notEmpty:true,
    //     len:[4,20]
    //   }
    // },
    salt_admin: {
      type: DataTypes.STRING
    },
    admin_password_hash: {
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
        this.setDataValue('admin_password_hash', hash);
        this.setDataValue('admin_password', val);
      }
    },
    // public_username: {
    //   type:DataTypes.STRING,
    //   allowNull: false,
    //   validate:{
    //     notEmpty:true,
    //     len:[4,20]
    //   }
    // },
    salt_public: {
      type:DataTypes.STRING
    },
    public_password_hash: {
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
        this.setDataValue('public_password_hash', hash);
        this.setDataValue('public_password', value);
      }
    }
  },{
    hooks: {
      beforeValidate: (user, options) => {
        if(typeof user.email === 'String'){
          user.admin_password = user.admin_password.toLowerCase();
          user.public_password = user.public_password.toLowerCase();
          user.username = user.email.trim().toLowerCase();
        }
      }
    }
  });

  // class method for bcrypt hash and compare them to check if
  // the value does exist
  User.authenticate = (body) => {
    return new Promise((resolve,reject) => {
      try {
        console.log('go through here in authenticate', body);
        let {email,options} = body;
        // check if body has property username and password, and if username
        // and password is a string
        if(body.hasOwnProperty('email') && body.hasOwnProperty('password')
      && typeof body.email === 'string' && typeof body.password === 'string') {
          User.findOne({
            where: {
              email:body.email
            }
          }).then((user) => {
            console.log('user is ', user);
            let passwordHash = (options === 'public_username') ? 'public_password_hash' : 'admin_password_hash';
            if(!user || !bcrypt.compareSync(body.password,user.get(passwordHash))) {
              return reject('password or email did not match');
            }
            resolve(user);
          })
          .catch(e => {
            console.log('error on promise', e);
            reject(e);
          }); // promise error
        }
      } catch(e) {
        console.log('error on validating username and password', e);
        return reject('password or email did not match');
      }
    });

  }

  return User;

}
