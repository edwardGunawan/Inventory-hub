const Sequelize = require('sequelize');

const sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect':'sqlite',
  'storage': __dirname + '/data/dev-product.sqlite'
});

let db = {};


db.product = sequelize.import(__dirname+'/model/product.js');
db.customer = sequelize.import(__dirname+'/model/customer.js');
db.user = sequelize.import(__dirname+'/model/user.js');
db.purchase = sequelize.import(__dirname+'/model/purchase.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// create many to many association for purchase (transaction) table
db.product.belongsToMany(db.customer,{through:db.purchase});
db.customer.belongsToMany(db.product,{through:db.purchase});


module.exports = db;
