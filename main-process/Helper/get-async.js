/*
  This is all the getter in the application
*/

let {ipcMain} = require('electron');
let db = require('../../db.js');

// get customer
ipcMain.on('get-customer', async(event,data) => {
  try {
    let customers = await db.customer.findAll();
    let customerNames = customers.map((customer) => {
      return customer.get('name');
    });
    console.log(customerNames);
    event.sender.send('reply-get-customer', {status:'OK', message:customerNames});
  } catch(e) {
    event.sender.send('reply-get-customer', {status:'Error', message:'Error in getting customer'})
  }
});

// get all product
ipcMain.on('get-product', async(event,data) => {
  try {
    let products = await db.product.findAll();
    let productItems = products.map((product) => {
      return {
        code: product.get('code'),
        quantity:  product.get('quantity'),
        price: product.get('price'),
        brand: product.get('brand')
      }
    });
    event.sender.send('reply-get-product', {status:'OK', message:productItems});
  }catch (e) {
    event.sender.send('reply-get-product',{status:'Error', message:e});
  }
})
