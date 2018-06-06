const Sequelize = require('sequelize');


let env = process.argv[2] || 'dev';
console.log('env in db.js', env);

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
// to create association between the intermediary table for join
db.purchaseDetail.belongsTo(db.product);
db.purchaseDetail.belongsTo(db.purchaseOrder);
db.purchaseOrder.hasMany(db.purchaseDetail);
db.product.hasMany(db.purchaseDetail);

 // action and purchaseOrder is 1:M action as a lookup table
db.action.hasMany(db.purchaseOrder);
db.purchaseOrder.belongsTo(db.action);

// product and action is M:N because 1 product can have many action and 1 action can be initiated
// by multiple product
// db.product.belongsToMany(db.action,{through:db.productTransactionHistory});
// db.action.belongsToMany(db.product,{through:db.productTransactionHistory});

// belongsToMany means many-to-many relation, it ensure that one entity will join with other entity
// through only one row in the intermediary table. There are none duplicate table, and if there are
// it will UPDATE and replace it instead of creating a new row to ensure that it is totally valid
// to have multiple product having the same action we have to do action HasMany productTransactionHistory
db.action.hasMany(db.productTransactionHistory);
db.productTransactionHistory.belongsTo(db.action);
db.product.hasMany(db.productTransactionHistory);
db.productTransactionHistory.belongsTo(db.product);


// customer and action is M:N because 1 customer can take many action, and 1 action can be
// taken by many customer
// through model doesn't set up association, therefore, not able to use eagerloading with customerTransactionHistory
// db.customer.belongsToMany(db.action,{through:db.customerTransactionHistory});
// db.action.belongsToMany(db.customer,{through:db.customerTransactionHistory});
db.customer.hasMany(db.customerTransactionHistory);
db.action.hasMany(db.customerTransactionHistory);
db.customerTransactionHistory.belongsTo(db.action);
db.customerTransactionHistory.belongsTo(db.customer);



module.exports = db;
