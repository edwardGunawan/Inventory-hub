/*
  This is all the getter in the application
*/

let {ipcMain} = require('electron');
let db = require('../../db.js');
let libInstance = require('./lib.js')({database:db});

// get customer
ipcMain.on('get-customer', async(event,data) => {
  try {
    let customerNames = await libInstance.get(data,'customer');
    event.sender.send('reply-get-customer', {status:'OK', message:customerNames});
  } catch(e) {
    event.sender.send('reply-get-customer', {status:'Error', message:'Error in getting customer'})
  }
});

// get all product
ipcMain.on('get-product', async(event,data) => {
  try {
    let productItems = await libInstance.get(data,'product');
    event.sender.send('reply-get-product', {status:'OK', message:productItems});
  }catch (e) {
    event.sender.send('reply-get-product',{status:'Error', message:e});
  }
})
