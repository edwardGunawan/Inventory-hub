const bcrypt = require('bcryptjs')
const cryptojs = require('crypto-js')
const env = require('../config/env')
const log = require('electron-log')

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
    salt_admin: {
      type: DataTypes.STRING
    },
    admin_password_hash: {
      type: DataTypes.STRING
    },
    admin_password_encrypt: {
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

        log.info('type of password', typeof val);
        // set the encryption with cryptojs for password recovery
        // NOTE: encrypt is not a string, need to do toString()
        let encrypt = cryptojs.AES.encrypt(val,env.secretKey)

        // log.info('encrypt key ', encrypt, typeof encrypt);

        // set dataValue for password (rest of the passwrod property but not the value) salt and hash
        this.setDataValue('salt_admin', salt);
        this.setDataValue('admin_password_hash', hash);
        this.setDataValue('admin_password', val);
        this.setDataValue('admin_password_encrypt',encrypt.toString());
      }
    }
  },{
    hooks: {
      beforeValidate: (user, options) => {
        if(typeof user.email === 'String'){
          user.admin_password = user.admin_password.toLowerCase();
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
        let {email,password} = body;
        // check if body has property username and password, and if username
        // and password is a string
        if(body.hasOwnProperty('password') && typeof body.password === 'string') {
          User.findOne({
            where: {
              email:body.email
            }
          }).then((user) => {
            console.log('user is ', user, body.password);
            // load hash from DB and compare with current passwrod
            if(!user || !bcrypt.compareSync(body.password,user.get('admin_password_hash'))) {
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

  /**
    Checking password
    NOTE: Arrow func `this` doesn't bound to dynamic this, but lexical this,
    arrow func is better used for subroutine (callbacks,non-method)
    Therefore, `this` in arrow func is reference to the global object
    instead of 'user' instance

    * method definition `this` in object attribute will bind to this as the object itself.
    * method definition for arrow function `this` will bind to the global object not
    the object that is defined

    */
  User.prototype.check = function (oldPassword) {
    try {
      if(!bcrypt.compareSync(oldPassword,this.get('admin_password_hash'))){
        throw 'old Password is not match'
      };
      return true;
    } catch(e) {
      throw e
    }
  }

  /**
    Getting password
    Get admin_password_encrypt and decrypt the admin_password to get
    original password, and return
    */
  User.prototype.getPassword = function() {
    try {
      let password_encrypt = this.get('admin_password_encrypt');
      let bytes = cryptojs.AES.decrypt(password_encrypt,env.secretKey)
      let pass = bytes.toString(cryptojs.enc.Utf8)
      log.info('pass exist', pass)
      return pass;
    } catch (e) {
      log.error(e)
      throw e
    }
  }
  return User;
}
