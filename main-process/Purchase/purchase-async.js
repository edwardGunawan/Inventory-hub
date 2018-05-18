const {ipcMain} = require('electron');
const db = require('../../db.js');
const moment = require('moment');
// Transaction History

ipcMain.on('purchase', async (event,data) => {
  // assuming data is an object of customer and
  // array of product quantity
  // discount
  try {
    let {customer,productArr,discount, action,totalPrice} = data;
    await purchaseOrder(data);
    event.sender.send('reply-purchase',{status:'OK', message:'Success'});
  }catch(e) {
    throw e;
    event.sender.send('reply-purchase',{status:'Error', message:e});
  }
});


/*
  Preprocess productArr, getting total price
  Create new PurchaseOrder instance and add Customer in it and totalPrice and discount
  Add Product to PurchaseOrder with PurchaseDetail

  Total : to also get all total amount after discount
  Item inside product Arr
  { brand: 'PierlJill',
   code: 'Product2',
   price: 11,
   quantity: '02',
   total: 22 }
*/
async function purchaseOrder({customer, productArr,discount,action,totalPrice}){
  // console.log(typeof totalPrice, 'totalPrice in purchaseOrder');
  let t = await db.sequelize.transaction();
  try {
    console.log(moment().valueOf());
    const order = await db.purchaseOrder.create({discount,totalPrice,timestamps:moment().valueOf()}, {transaction:t});
    const actionInst = await db.action.findOne({where:{action}},{transaction:t});
    const customerInst = await db.customer.findOne({where:{name:customer}}, {transaction:t});

    // this is the correct based on what you write on your define method
    await actionInst.addPurchase_order(order,{transaction:t});
    await customerInst.addPurchase_order(order,{transaction:t});

    for(let {brand, code, price, quantity, total} of productArr) {
      let product = await db.product.findOne({where:{code}},{transaction:t});
      await product.addPurchase_order(order,{through:{
        quantity,
        totalPricePerItem:total
      }, transaction:t});

      if(action === 'sell') {
        // quantity is string some how
        product.quantity -= parseInt(quantity);
      }else {
        // console.log(typeof quantity , ' for quantity in purchase');
        product.quantity += parseInt(quantity);
      }
      await product.save({transaction:t})
    }
    await t.commit();
    console.log('transaction successful');
  } catch(e) {
    console.log(e);
    await t.rollback();
    throw e;
  }
}
