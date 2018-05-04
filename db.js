const Sequelize = require('sequelize');

const sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect':'sqlite',
  'storage': __dirname + '/data/dev-product.sqlite'
});

let db = {};


db.product = sequelize.import(__dirname+'/model/product.js');
db.customer = sequelize.import(__dirname+'/model/customer.js');
db.user = sequelize.import(__dirname+'/model/user.js');
db.purchaseDetail = sequelize.import(__dirname+'/model/purchase-detail.js');
db.purchaseOrder = sequelize.import(__dirname+'/model/purchase-order.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// create many to many association for purchase (transaction) table
// it needs to have hasMany and belongsTo
db.customer.hasMany(db.purchaseOrder);
db.purchaseOrder.belongsTo(db.customer);
db.product.belongsToMany(db.purchaseOrder,{through:db.purchaseDetail});
db.purchaseOrder.belongsToMany(db.product,{through:db.purchaseDetail});


module.exports = db;
