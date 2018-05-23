const {ipcMain} = require('electron');
const db = require('../../db.js');
const moment = require('moment');
const libInstance = require('../Helper/lib.js')({database:db});
// Transaction History

ipcMain.on('purchase', async (event,data) => {
  // assuming data is an object of customer and
  // array of product quantity
  // discount
  try {
    let {customer,productArr,discount, action,totalPrice} = data;
    await libInstance.purchaseOrder(data);
    event.sender.send('reply-purchase',{status:'OK', message:'Success'});
  }catch(e) {
    throw e;
    event.sender.send('reply-purchase',{status:'Error', message:e});
  }
});
