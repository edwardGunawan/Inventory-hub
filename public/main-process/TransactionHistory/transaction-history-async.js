const {ipcMain, app} = require('electron');
const db = require('../../db.js');

const moment = require('moment');
const fs = require('fs');
const path = require('path');
const dirPath = app.getPath('desktop');
let libInstance;
checkOrCreateDir(path.join(dirPath,'inventoryTransactionHistory')).then((transactionPath) => {
  console.log('in transactionHistory', transactionPath);
  libInstance = require('../Helper/lib.js')({database:db,pathname:transactionPath});
});


ipcMain.on('transaction-history-init', async(evt,data) => {
  try {
    const rawData = await libInstance.init();
    let {orderDates,customerHistoryDates,productHistoryDates} = rawData;
    evt.sender.send('reply-transaction-history-init', {status:'OK', message:{orderDates,customerHistoryDates,productHistoryDates}});
  } catch(e) {
    evt.sender.send('reply-transaction-history-init',{status:'Error',message:e});
    throw e;
  }
});


ipcMain.on('get-transaction', async (evt, data) => {
  try {
    // it can only be assigned to default if the value is undefined
    let {beginTimestamps,endTimestamps=moment(beginTimestamps).add(1,'months').valueOf(),category} = data;
    let transactionHistory;
    console.log('category', category, beginTimestamps, endTimestamps);

    switch(category) {
      case 'Product':
        transactionHistory = await libInstance.getProductHistoryDetail(beginTimestamps,endTimestamps);
        break;
      case 'Order':
        transactionHistory = await libInstance.getPurchaseDetail(beginTimestamps,endTimestamps);
        break;
      case 'Customer':
        transactionHistory = await libInstance.getCustomerHistoryDetail(beginTimestamps,endTimestamps);
        break;
    }
    console.log('transactionHistory', transactionHistory);
    evt.sender.send('reply-get-transaction', {status:'OK', message:transactionHistory});
  }catch (e) {
    evt.sender.send('reply-get-trasaction', {status:'Error', message:e});
    throw e;
  }
});

  // Transform to Excel
ipcMain.on('transfer-excel', async(evt,data) => {
  try {
    let {category, filterResult} = data;
    let objArr =[];
    switch(category) {
      case 'Order':
        libInstance.writeToSheet(['based Date','based Customer','based Product'],filterResult,'date','customer','product');
        break;
      case 'Product':
        libInstance.writeToSheet(['based Date'],filterResult,'productHistory');
        break;
      case 'Customer':
        libInstance.writeToSheet(['based Date'],filterResult,'customerHistory');
        break;
    }
    evt.sender.send('reply-transfer-excel',{status:'OK', message:'All data is converted'});
  } catch(e) {
    console.log(e);
    throw e;
  }
});

async function checkOrCreateDir(path) {
  try {
    fs.statSync(path);
    return path;
  }catch (e) {
    fs.mkdirSync(path);
    return path;
  }
}

// let update_arr_customer = [
//   {where:{name:'Customer1'},updates:{name: 'Toko Sinarmata'}},
//   {where:{name:'Customer2'}, updates:{name:'Toko Pedia'}}
// ];
// let update_arr_product = [
//   {where:{code:'Product1'},updates:{brand:'Movado',price:'12'}},
//   {where:{code:'Product2'},updates:{brand:'Rolex',price:'1000'}}
// ];
//
// let destroy_customer = {name:['Toko Pedia','Toko Sinarmata']};
// let destroy_product={code:['Product3']};
//
// let customer_input_arr = [
//   {name:'Customer1'},
//   {name:'Customer2'},
//   {name:'Customer3'}
// ]
//
// let product_input_arr = [
//   {code:'Product1',brand:'Sam Cafaso',quantity:10, price:1000},
//   {code:'Product2',brand:'Pierl Jill',quantity:100, price:1000},
//   {code:'Product3',brand:'Sam Cafaso',quantity:20, price:1000},
//   {code:'Product4',brand:'Movado',quantity:30, price:1000},
//   {code:'Product5',brand:'Rolex',quantity:10, price:1000},
// ];
// let restock_input_arr = [
//   {code:'Product1',brand:'Sam Cafaso',quantity:11, price:1000},
//   {code:'Product5',brand:'Rolex',quantity:11, price:1000},
// ];
//
//
// let libInstance = lib({database:db});
// libInstance
// .init().then((res) => {
//   return libInstance.getPurchaseDetail(5,2018);
// }).then((res) => {
//   console.log(res);
// })
// .delete(destroy_customer,'customer').then((numAffectedRows) => {
//   console.log(numAffectedRows);
// })

// .createTransaction(customer_input_arr,'customer').then(() => {
//   console.log('finish creating customer, creating product now....');
//   return libInstance.createTransaction(product_input_arr,'product');
// }).then(() => {
//   console.log('finish creating product, restocking product now .....');
//   return libInstance.createTransaction(restock_input_arr,'restock');
// }).then(() => {
//   console.log('finish restoring product, get product history now');
//   return libInstance.getProductHistory('new');
// }).then((data) => {
//   console.log('product history new', data);
//   return libInstance.getProductHistory('restock');
// }).then((data) => {
//   console.log('product history restock', data);
//   return libInstance.update(update_arr_product,'product')
// }).then(() => {
//   console.log('finish updating product, now update customer....');
//   return libInstance.update(update_arr_customer,'customer');
// }).then(() => {
//   console.log('finish updating customer');
// })
// .initProductHistory().then(({actionProductIndex,productHistory}) => {
//   console.log(actionProductIndex);
//   // console.log(productHistory);
//   Object.keys(productHistory).forEach((timestamps) => {
//     // console.log(timestamps);
//     Object.keys(productHistory[timestamps]).forEach((action) => {
//       console.log(typeof productHistory[timestamps][action]);
//
//     })
//   });
// })
// .initCustomerHistory().then(({actionCustomerIndex,customerHistory}) => {
//   // console.log(actionCustomerIndex);
//   console.log(customerHistory);
// })
// .initPurchaseDetail().then(({orderDates,purchaseMap,customerPurchaseIndex}) => {
//   console.log(orderDates);
//   console.log(customerPurchaseIndex);
//   console.log(purchaseMap);
//   orderDates.forEach((timestamps) => {
//     console.log(moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm:ss'));
//   });
// })
// .catch(e => {
//   console.log(e);
// });
// then(()=> lib.getTransaction(05,2018))
// .then(
//   (objArr) => convert.writeToSheet(['based Date','based Customer','based Product'],objArr,'date','customer','product'))
// .then(() => console.log('finish executing'))
// .catch(e => console.error(e) );
