const {ipcMain} = require('electron');
const db = require('../../db.js');
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

  // preprocess the totalPrice adding all of them together
  return db.sequelize.transaction(function(t) {
      return db.purchaseOrder.create({discount,totalPrice,action}, {transaction:t})
      .then((order) => {
        let promises = [];
        // finding all the product from product
        productArr.forEach((prod) => {
          let {code} = prod;

          // find product based on code
          let productFoundPromise = db.product.findOne({where:{code}}, {transaction:t});
          promises.push(productFoundPromise);
        });

        // adding customer accessor to purchaseOrder to the promise and executed it too
        promises.push(db.customer.findOne({where:{name:customer}}, {transaction:t}));

        return Promise.all(promises).then((arr) => {
            let promises = [];
            // adding new purchase detail on schema purchase detail
            // updating product value
            arr.forEach((item,i) => {
              if(i < productArr.length) {
                let {quantity,total} = productArr[i];
                // creating purchaseDetail on order and product
                promises.push(item.addPurchaseOrder(order,{through:{
                  quantity,
                  totalPricePerItem:total,
                  pricePerItem: item.get('price')
                }, transaction:t}));
                // update quantity of product table
                if(action === 'sell') {
                  // quantity is string some how
                  item.quantity -= parseInt(quantity);
                }else {
                  // console.log(typeof quantity , ' for quantity in purchase');
                  item.quantity += parseInt(quantity);
                }
                promises.push(item.save({transaction:t}));
              } else { // the last value will be the customer since we push the customer promises
                if(item!== null) {
                  // adding customer foreign key cosntraint to order instance
                  promises.push(item.addPurchaseOrder(order,{transaction:t}));
                }

              }
            });
            return Promise.all(promises);
          }).catch(e => {
            console.log(e);
            throw e;
          });
        });
      }).then(() => console.log('succeded'))
      .catch(e => {
        console.log(e);
        throw e;
      });
    }

// acc is a promise
// therefore after return you need to use then to get the value
// of the promise
// let reduceHelper = (acc,curr) => {
//   let{code,quantity} = curr;
//   return db.product.findOne({where:{code}}).then((prod) => {
//     return acc.then((curTotal) => {
//       let val = prod.get('price') * quantity+curTotal;
//       return val
//     })
//   }).catch(e => console.log(e));
// }
