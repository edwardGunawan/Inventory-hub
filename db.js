const Sequelize = require('sequelize');


let env = process.argv[2] || 'dev';

let sequelize;
if(env === 'production') {
  sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect':'sqlite',
    'storage': __dirname + '/data/prod-inventory.sqlite'
  });
} else if(env === 'dev') {
  sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect':'sqlite',
    'storage': __dirname + '/data/dev-inventory.sqlite'
  });
} else {
  sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect':'sqlite',
    'storage': __dirname + '/data/test-inventory.sqlite'
  });
}


let db = {};


db.product = sequelize.import(__dirname+'/model/product.js');
db.customer = sequelize.import(__dirname+'/model/customer.js');
db.user = sequelize.import(__dirname+'/model/user.js');
db.purchaseDetail = sequelize.import(__dirname+'/model/purchase_detail.js');
db.purchaseOrder = sequelize.import(__dirname+'/model/purchase_order.js');
db.action = sequelize.import(__dirname+'/model/action.js');
db.productTransactionHistory = sequelize.import(__dirname+'/model/product_transaction_history.js');
db.customerTransactionHistory = sequelize.import(__dirname+'/model/customer_transaction_history.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// create many to many association for purchase (transaction) table
// it needs to have hasMany and belongsTo
db.customer.hasMany(db.purchaseOrder);
db.purchaseOrder.belongsTo(db.customer);
db.product.belongsToMany(db.purchaseOrder,{through:db.purchaseDetail});
db.purchaseOrder.belongsToMany(db.product,{through:db.purchaseDetail});

 // action and purchaseOrder is 1:M action as a lookup table
db.action.hasMany(db.purchaseOrder);
db.purchaseOrder.belongsTo(db.action);

// product and action is M:N because 1 product can have many action and 1 action can be initiated
// by multiple product
db.product.belongsToMany(db.action,{through:db.productTransactionHistory});
db.action.belongsToMany(db.product,{through:db.productTransactionHistory});


// customer and action is M:N because 1 customer can take many action, and 1 action can be
// taken by many customer
db.customer.belongsToMany(db.action,{through:db.customerTransactionHistory});
db.action.belongsToMany(db.customer,{through:db.customerTransactionHistory});


module.exports = db;
