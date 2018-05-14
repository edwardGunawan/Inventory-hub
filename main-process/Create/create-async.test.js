// const db = require('../../db.js');
// const {createTransaction} = require('./create-async.js')
// describe('initialization db', () => {
//   before(function() {
//     db.sequelize
//       .authenticate()
//       .then(() => {
//         console.log('Connection has been established successfully');
//         return db.sequelize.sync({force:true});
//       })
//       .then(() => {
//         console.log('db is already in sync');
//         return db.sequelize.transaction(function(t) {
//           return db.customer.findOrCreate({
//             where: { name:'Other' }, defaults:{name:'Other'},transaction:t}).then(() => {
//             let actions = ['sell','return','new','restock'];
//             let promises = [];
//             actions.forEach((action) => {
//               promises.push(db.action.findOrCreate({ where: {action: action},transaction:t}));
//             });
//             return Promise.all(promises);
//           }).catch(e => {
//             console.log('something is wrong with transaction', e);
//             throw e;
//           });
//         })
//       }).then((res) => {
//         console.log(`finished initializing`);
//       })
//       .catch(e => {
//         console.log('Unable to connect/initialized to the database', e);
//         throw e;
//       });
//   });
// });
// // createTransaction test
