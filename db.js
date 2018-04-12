const Sequelize = require('sequelize');

const sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect':'sqlite',
  'storage': __dirname + '/data/dev-product.sqlite'
});

let db = {};


db.product = sequelize.import(__dirname+'/model/product.js');
db.user = sequelize.import(__dirname+'/model/user.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;
