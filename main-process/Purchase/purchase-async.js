// const {ipcMain} = require('electron');
const db = require('../../db.js');
// Transaction History

/*ipcMain.on('purchase', async (event,data) => {
  // assuming data is an object of customer and
  // array of product quantity
  // discount
  try {
    let {customer,productArr,discount, action} = data;
    purchaseOrder(customer,productArr,discount,action);
    event.sender.send('reply-purchase',{status:'OK', message:'Success'});
  }catch(e) {
    event.sender.send('reply-purchase',{status:'Error', message:e});
  }
});*/





/*
  Preprocess productArr, getting total price
  Create new PurchaseOrder instance and add Customer in it and totalPrice and discount
  Add Product to PurchaseOrder with PurchaseDetail
*/
let purchaseOrder = ({customer, productArr,discount,action}) => {
  // preprocess the totalPrice adding all of them together
  let total = productArr.reduce(reduceHelper,Promise.resolve(0));
  total.then((totalPrice) => {
    // if the action is not sold, then the totalPrice is negative
    if(action === 'return') totalPrice = (-totalPrice);
    return db.purchaseOrder.create({discount,totalPrice,action});
  })
  .then((order) => {
    // connect association to customer and purchaseOrder
    return db.customer.findOne({ where:{ name:customer}} ).then((cust_instance) => {
      cust_instance.addPurchaseOrder(order);
      return {productArr,order};
    });
  })
  .then(({productArr,order}) => {
    // connect product with purchaseOrder through purchaseDetail
    productArr.forEach((prod) => {
      let {code,quantity} = prod;
      // find product based on code
      db.product.findOne({where:{code}}).then((prod_instance) => {
        let totalPricePerItem = quantity * prod_instance.get('price');
        if(action === 'sold') {
          prod_instance.quantity -= quantity;
        }else {
          prod_instance.quantity+= quantity;
        }
        prod_instance.save().then((prod) => {
          console.log(prod, 'here in prod');
          prod_instance.addPurchaseOrder(order,{through:{
            quantity,
            totalPricePerItem,
            pricePerItem: prod_instance.get('price')
          }});
        }).catch(e => {
            e.forEach(error => {
              console.log(error.message);
            })
          });
      })
    })
  })
  .catch(e => {
    e.forEach(error => {
      console.log(error.message);
    });
  });
}

// acc is a promise
// therefore after return you need to use then to get the value
// of the promise
let reduceHelper = (acc,curr) => {
  let{code,quantity} = curr;
  return db.product.findOne({where:{code}}).then((prod) => {
    return acc.then((curTotal) => {
      let val = prod.get('price') * quantity+curTotal;
      return val
    })
  }).catch(e => console.log(e));
}

module.exports = purchaseOrder;
