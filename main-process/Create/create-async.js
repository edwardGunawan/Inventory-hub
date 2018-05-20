let {ipcMain, app} = require('electron');
let db = require('../../db.js');
let XLSX = require('xlsx');

/*
  Create new product
*/
// One product, or multiple still using bulkCreate function
// data argument contained product array, [code,amount,price]
ipcMain.on('create-product', async (event,data) => {
  try {
    let {input_arr} = data;
    await createTransaction(input_arr,'product');
    event.sender.send('reply-create-product', {status:'OK', message:'all products is created'});
  } catch(e) {
    console.log('error in create', e);
    throw e;
    event.sender.send('reply-create-product', {status:'Error', message:e});
  }
});


// restock item
ipcMain.on('restock', async(evt,data) => {
  try {
    let {input_arr} = data;
    await createTransaction(input_arr,'restock');
    evt.sender.send('reply-restock',{status:'OK', message:'all product has been processed'});
  } catch(e) {
    console.log('error in restock', e);
    throw e;
    evt.sender.send('reply-restock', {status:'Error', message:e});
  }
})



// Import from Excel
// data will contain path for excel spreadsheet
ipcMain.on('bulk-import',async (event,data) => {
  try {
    let {path} = data;
    console.log('go through bulk-import', path);
    let excelObj = await importExcel(path);
    console.log(excelObj);
    let products = await db.product.bulkCreate(excelObj,{returning:true}); // returning auto-generate id
    event.sender.send('reply-bulk-import', {status:'OK', message:'Import From Excel Succeed'});
  }catch(e) {
    // console.log('go through error',e);
    event.sender.send('reply-bulk-import', {status:'Error', message: e});
  }
});

/*
  Create Customer name
*/
ipcMain.on('create-customer', async (event, data) => {
  try {
    let{input_arr} = data;
    await createTransaction(input_arr,'customer');
    event.sender.send('reply-create-customer', {status:'OK', message:'all customers is created'});
  } catch(e) {
    console.log('error in creating customer');
    event.sender.send('reply-create-customer', {status:'Error', message:e});
  }
})




/*
  Helper function
  */
async function importExcel(path) {
  try {
    let workbook = XLSX.readFile(path);

    let ws = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);

    // get rid of frist 3 because that is the description
    ws.splice(0,3);

    // bulk Import needs to add id by itself, it can't generate ID
    return ws.map((item,i) => {
      let {__EMPTY_1} = item; // amount
      return {
        code: item['Posisi Stok'],
        quantity: Number(__EMPTY_1.replace(/,/g,'')), // get rid of commas for integer value
        price: 100, // current still fixed, excel should write price number
        brand:(i%2 === 0)?'Charlie-Jill':'Sam Cafaso'
      }
    });
  } catch (e) {
    // console.log('go through error');
    throw new Error(e);
  }
}

async function createTransaction(input_arr,category) {
  const t = await db.sequelize.transaction();
  try {
    let instances, action,transactionHistory;
    switch(category) {
      case 'product':
        instances = await db.product.bulkCreate(input_arr,{returning:true, transaction:t});
        action = await db.action.findOne({where:{ action: 'new'}}, {transaction:t});
        break;
      case 'customer':
        instances = await db.customer.bulkCreate(input_arr,{returning:true, transaction:t});
        action = await db.action.findOne({where:{ action: 'new'}}, {transaction:t});
        break;
      case 'restock' :
        action = await db.action.findOne({where:{ action: 'restock'}}, {transaction:t});
        for(let {code,brand,quantity,price} of input_arr) {
          let prod = await db.product.findOne({where:{code}}, {transaction:t});
          let actionId = await action.get('action',{transaction:t});
          transactionHistory = await db.productTransactionHistory.create({quantity},{transaction:t});
          // adding hasMany from product to productTransactionHistory
          await prod.addProduct_transaction_history(transactionHistory,{transaction:t});
          await action.addProduct_transaction_history(transactionHistory,{transaction:t});
          prod.quantity += parseInt(quantity);
          await prod.save({transaction:t});
        }
        break;
    }



    if(category === 'customer' || category === 'product') {
      let promises = [];
      for(let inst of instances) {
        if(category === 'product') {
          let quantity = await inst.get('quantity',{transaction:t});
          transactionHistory = await db.productTransactionHistory.create({quantity},{transaction:t});
          promises.push(inst.addProduct_transaction_history(transactionHistory,{transaction:t})); // product
          promises.push(action.addProduct_transaction_history(transactionHistory,{transaction:t})); // action
        }else {
          promises.push(inst.addAction(action, {through:{},transaction:t}));
        }
      }
      await Promise.all(promises);
    }
    await t.commit();
    console.log('transaction is succeeeded');
  }catch(e) {
    console.log(e);
    await t.rollback();
    throw e;
  }

};
