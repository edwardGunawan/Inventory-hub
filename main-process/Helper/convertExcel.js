const db = require('../../db.js');
const moment = require('moment');
const path = require('path');

const Op = db.Sequelize.Op;


function convertExcel({
  SheetNames=[], // SheetNames
  Sheets={}, // Sheet
  title ='Transaction',
  author='Edward Huang',
  database,
  pathname=path.join(__dirname,'../TransactionHistory/out.xlsx')
} = {}) {
  try {
    if(typeof database === 'undefined') {
      // throw new Error('Need to provide database');
      throw 'Need to provide database';
    }

    const wb = {SheetNames, Sheets};
    wb.Props = {
      Title: title,
      Author: author
    }

    let rawData= [];
    let yearMap = new Map(); // key map of map (month object , object based date)

    return {

      // Get all data from the database put it in rawData array
      async init() {
        try {
          let purchaseOrders = await database.purchaseOrder.findAll();

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
            /*
              Map (Key,Value)
              Year(number) -> Month (objKey (number))
              (objKey(number)) -> (objKey (number))
              Month -> Date
              (objKey(number)) -> (objKey(string))
              Date-> CustomerName
              (objKey(string)) -> (obj(value))
              CustomerName -> CustomerObj
            */
          for(let order of purchaseOrders) {
            console.log('go through order purchase for loop');
            // NOTE: Can't do order.getCustomer because you didn't set the association belongsTo
            // need to set hasMany which put association key to order and belongsTo which put
            // connect that association key back to order in customer get
            // , you can do is setCustomer but not able to getCustomer
            // you are able to getPurchaseOrder when calling customerInstance
            // getting customer name
            let customer = await order.getCustomer();
            let customerName = customer.get('name');
            let timestamps = order.get('timestamps');
            let date = moment.utc(timestamps).local().date();
            let month = moment.utc(timestamps).local().month()+1; // because month is zero indexed
            let year = moment.utc(timestamps).local().year();
            let id = order.get('id');

            if(!yearMap.has(year)) {
              let monthObj = {}; // key-month, value-date
              yearMap.set(year,monthObj);
            }

            if(yearMap.get(year)[`${month}`] === undefined) { // key-date, value-customer
              yearMap.get(year)[`${month}`] = {};
            }
            if(yearMap.get(year)[`${month}`][`${date}`] === undefined) { // key-customerName , value-array
              yearMap.get(year)[`${month}`][`${date}`] = {};
            }
            if(yearMap.get(year)[`${month}`][`${date}`][`${customerName}`] === undefined) {
              yearMap.get(year)[`${month}`][`${date}`][`${customerName}`] = []; // objValue will be an array
            }


            let purchaseDetails = await database.purchaseDetail.findAll({where:{purchaseOrderId : id}});
            // console.log(`
            //   Time: ${moment.utc(order.get('timestamps')).format('MM/DD/YYYY')}
            //   Customer :`${customerName}
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
              let product = await database.product.findById(productId);
              // console.log(product, ' product instance here');


              let rawDataObj = {
                date: moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),
                customer: customerName,
                code: product.get('code'),
                brand: product.get('brand'),
                quantity: detail.get('quantity'),
                discount: order.get('discount'),
                action:order.get('action'),
                price: detail.get('pricePerItem'),
                subTotal: detail.get('totalPricePerItem')
              }

              rawData.push(rawDataObj);

              yearMap.get(year)[`${month}`][`${date}`][`${customerName}`].push(rawDataObj);
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
          ////// DEBUG ////////////
          // console.log('rawdata',rawData);
          // console.log('yearMap', yearMap);
          // yearMap.forEach((monthObj,year) => {
          //   console.log(year);
          //   Object.keys(monthObj).forEach((monthKey) => {
          //     console.log(`month : ${monthKey}`);
          //     for(let dateKey in monthObj[monthKey]) {
          //       console.log(`date: ${dateKey} `);
          //       let dateObj = monthObj[monthKey][dateKey];
          //       Object.keys(dateObj).forEach((customerKey) => {
          //         console.log(`customerName: ${customerKey}`);
          //         dateObj[customerKey].forEach((d) => console.log('objValue: ', d));
          //       });
          //     }
          //   });
          // })
          /////////////////////////////
          return rawData;
        } catch(e) {
          throw e;
        }
      },

      // find PurchaseOrder (By Month) -> getCustomer, getPurchaseDetail ->
      // getProduct -> get('Code'), get('Brand')
      async getTransaction(startMonth=1, startYear=2018, endMonth=startMonth+1, endYear=startYear) {
        try {
          if(yearMap.size === 0) {
            throw new Error('You need to passed init first');
          }
          if(startMonth > 12 || startMonth < 0 || endMonth > 12 || endMonth <= 0) {
            throw new Error('You insert either the wrong startMonth or endMonth argument');
          }

          if(!yearMap.has(startYear) || !yearMap.has(endYear)) throw `There are no transaction found in ${year}`;

          let objArr = [];
          let year = startYear;
          let month = startMonth;
          while(yearMap.has(year) && year <= endYear) {
            // console.log('year in while loop', year);
            let monthObj = yearMap.get(year);
            for(let i = month ; i< 12; i++) {
              if(year === endYear && i > endMonth) break;
              Object.keys(monthObj[i]).forEach((dateKey) => {
                // console.log('in side object keys', dateKey);
                // console.log(monthObj[startMonth][dateKey]);
                for(let customerName in monthObj[i][dateKey]) {
                  objArr = [...objArr,...monthObj[i][dateKey][customerName]];
                }
              });
              i++;
            }

            month = 1; // reset month to 1
            year++;
          }


          // console.log('objArr in getTransaction', objArr);
          return objArr;
        } catch(e) {
          throw e;
        }
      },

      /*
        Create Sheet for with ws_name and append to wb
        return an instance of ws to either append it to wb later
      */
      createSheet(objArr=[], based='date') {
        if(typeof require !== 'undefined') XLSX = require('xlsx');
        let header = [];
        switch(based) {
          case 'customer':
            header = ["customer","date","action","code","brand","quantity",
            "discount","price","subTotal"];
            break;
          case 'product':
            header=["code","brand","date","action","quantity","customer","discount",
            "price","subTotal"];
            break;
          default:
            header = ["date","customer","code","brand","action","quantity",
            "discount","price","subTotal"];
        }
        let ws = XLSX.utils.json_to_sheet(objArr,{header:header});
        return ws;
      },
      /*
        Append ws to wb and return it
      */
      appendToWb(ws={}, ws_name='raw data') {
        try {
          XLSX.utils.book_append_sheet(wb,ws,ws_name);
        } catch(e) {
          throw new Error(e);
        }

      },
      // https://github.com/SheetJS/js-xlsx/issues/610
      /*
        Argument takes array of objArr, content and array of ws_name sheetname
        */
      writeToSheet(ws_name=[],objArr,...based) {
        try {
          ws_name.forEach((name,index) => {
            // console.log('obj based: ', based[index], name);
            this.appendToWb(this.createSheet(objArr,based[index]),name);
          });
          XLSX.writeFile(wb,pathname);
        } catch(e) {
          throw e;
        }
      }
    }
  } catch (e) {
    throw new Error(e);
  }


}


module.exports = convertExcel;
