const db = require('../../db.js');
let purchaseOrder = require('./purchase-async.js');
console.log(purchaseOrder);

let data = {
  customer:'Toko Cermelang',
  productArr : [
    {
      code:'JOK-I5-UU',
      quantity:1
    },
    {
      code:'KI-H6788',
      quantity:3
    },
    {
      code:'KI-HH-hh',
      quantity:3
    }
  ],
  discount:20,
  action:'out'
}

purchaseOrder(data);
