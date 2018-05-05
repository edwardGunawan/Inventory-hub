const db = require('../../db.js');
const moment = require('moment');
const path = require('path');

const Op = db.Sequelize.Op;


function convertExcel({
  SheetNames=[], // SheetNames
  Sheets={}, // Sheet
  title ='Transaction',
  author='Edward Huang',
  pathname=path.join(__dirname,'../TransactionHistory/out.xlsx')
} = {}) {
  const wb = {SheetNames, Sheets};
  wb.Props = {
    Title: title,
    Author: author
  }

  return {
    // find PurchaseOrder (By Month) -> getCustomer, getPurchaseDetail ->
    // getProduct -> get('Code'), get('Brand')
    async getTransactionDetailBasedMonth(month='00', year='2018') {
      try {

        let date = moment(`${year}-0${parseInt(month)}`); // get moment data asked
        // because moment subtract also mutate the value, we need to deep clone before doing so
        // and store it in prevMonthDate
        // if it is january, it will ask for january and feb
        let nextMonthDate = date.clone().add(1,'months');
        // console.log(date.toString());
        // console.log(nextMonthDate.toString());

        let purchaseOrders = await db.purchaseOrder.findAll({
          where: {
            timestamps: {
              [Op.lt] : nextMonthDate.valueOf(),
              [Op.gt] : date.valueOf()
            }
          }
        });
        /*
          {
            Date,
            Code,
            Brand,
            Customer,
            Quantity,
            Discount,
            Price,
            totalPricePerItem,
          }
          */
        let data =[];
        for(let order of purchaseOrders) {
          // NOTE: Can't do order.getCustomer because you didn't set the association belongsTo
          // need to set hasMany which put association key to order and belongsTo which put
          // connect that association key back to order in customer get
          // , you can do is setCustomer but not able to getCustomer
          // you are able to getPurchaseOrder when calling customerInstance
          // getting customer name
          let customer = await order.getCustomer();
          let id = order.get('id');

          let purchaseDetails = await db.purchaseDetail.findAll({where:{purchaseOrderId : id}});
          // console.log(`
          //   Time: ${moment.utc(order.get('timestamps')).format('MM/DD/YYYY')}
          //   Customer : ${customer.get('name')}
          //   Order Number ${order.get('id')}
          //
          //   Discount: ${order.get('discount')}
          //   Total: ${order.get('totalPrice')}
          //   Action: ${order.get('action')}
          //   `);
          // can't do forEach cause: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
          for(let detail of purchaseDetails) {
            let productId = detail.get('productId');
            // get db product
            let product = await db.product.findById(productId);
            console.log(product, ' product instance here');
            data.push({
              date: moment.utc(order.get('timestamps')).format('YYYY/MM/DD/HH:mm'),
              customer:customer.get('name'),
              code: product.get('code'),
              brand: product.get('brand'),
              quantity: detail.get('quantity'),
              discount: order.get('discount'),
              price: detail.get('pricePerItem'),
              subTotal: detail.get('totalPricePerItem')
            });
          }
          // order and product has many to many relationship
          // let products = await order.getProducts();
          // products.forEach((product) => {
          //   console.log(`
          //         Product: ${product.get('id')}
          //             Code: ${product.get('code')}
          //             Brand: ${product.get('brand')}
          //         `);
          // });
        }
        // console.log('data',data);
        return data;
      }catch (e) {
        console.log(`Error inside getTransactionDetail ${e}`);
      }
    },

    /*
      GetCustomerDetailBasedMonth(month,year)
      apply getTransactionDetailBasedMonth, get the data then
      reiterate data based on customer
    */
    async GetCustomerDetailBasedMonth(month='00',year='2018') {
      try {
        await this.getTransactionDetailBasedMonth(month,year);
        // data is here
        // TODO: getting the customer out and sort each of the customer based on
        // on the month year that they have
      }catch(e) {
        console.log(e);
      }
    },
    /*
      Create Sheet for with ws_name and append to wb
      return an instance of ws to either append it to wb later
    */
    createSheet(objArr=[]) {
      if(typeof require !== 'undefined') XLSX = require('xlsx');
      let ws = XLSX.utils.json_to_sheet(objArr);
      return ws;
    },
    /*
      Append ws to wb and return it
    */
    appendToWb(ws={}, ws_name='raw data') {
        XLSX.utils.book_append_sheet(wb,ws,ws_name);
    },
    // https://github.com/SheetJS/js-xlsx/issues/610
    /*
      Argument takes array of objArr, content and array of ws_name sheetname
      */
    writeToSheet(ws_name=[],...objArr) {
      try {
        for(let [index,obj] of objArr.entries()) {
          this.appendToWb(this.createSheet(obj),ws_name[index]);
        }
        XLSX.writeFile(wb,pathname);
      } catch(e) {
        console.log(e, ' in writeToSheet');
      }
    }
  }

}


module.exports = convertExcel;
