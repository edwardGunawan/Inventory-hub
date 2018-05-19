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

    let purchaseMap = new Map(); // timestamps as key and array as productData
    let customerPurchaseIndex = new Map(); // customerName as key, and value will be the timestamps for index
    let orderTimeStamps = []; // render all timestamps to the frontend

    let customerHistory = new Object(); // timestampsObject - action (object) - customerName
    let actionCustomerIndex = new Map(); // key string (action) - array () timestamps (this breaks down to year/month/date to index to customerHistoryMap)
    let customerHistoryTimeStamps = []; // render all timestamps to the frontend

    let productHistory = new Object(); // timestamps obj - action (object) - {productCode, quantity}
    let actionProductIndex = new Map(); // key string (action) - array () timestamps (this breaks down to year/month/date to index to productHistory)
    let productHistoryTimeStamps = []; // render all timestamps to the frontend

    return {
      /**
       init: Call initPurchaseDetail(), initCustomerHistory() and initProductHistory()
       return all the value between the three
      */
      async init() {
        const t = await database.sequelize.transaction();
        try {
          await Promise.all([this.initPurchaseDetail({transaction:t}),this.initCustomerHistory({transaction:t}),this.initProductHistory({transaction:t})]);
          await t.commit();
          return {
            purchaseDetail: {orderTimeStamps, purchaseMap, customerPurchaseIndex},
            customerHistory:{actionCustomerIndex, customerHistory},
            productHistory: {actionProductIndex,productHistory}
          }
        } catch(e) {
          console.log(e);
          await t.rollback();
          throw e;
        }
      },
      /**
        Data Structure:
         purchaseMap: regular data for customerPurchaseIndexing and orderTimestamps
           timestamps as key and array of productData
         customerPurchaseIndex: indexing based on customer
           customerName as key, and array of timestamps as value to index the timestamps
         orderTimeStamps array of timestamps to render back to frontend
      */
      async initPurchaseDetail() {
        const t = await database.sequelize.transaction();
        try {
          const orders = await database.purchaseOrder.findAll({transaction:t});
          for(let order of orders) {
            let customer = await order.getCustomer({transaction:t});
            let customerName = customer.get('name', {transaction:t});
            let timestamps = order.get('timestamps', {transaction:t});
            let products = await order.getProducts({transaction:t});
            let action = await order.getAction({transaction:t}).get('action',{transaction:t});
            let productData = {}

            for(let product of products) {
              let subTotal = product.purchase_detail.get('totalPricePerItem');
              let quantity = product.purchase_detail.get('quantity');
              productData = {
                date: moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),
                customer: customerName,
                discount: order.get('discount'),
                action,
                code: product.get('code'),
                brand: product.get('brand'),
                quantity,
                price: product.get('price'),
                subTotal
              }
              if(!purchaseMap.has(timestamps)) {
                purchaseMap.set(timestamps,[]);
              }
              purchaseMap.get(timestamps).push(productData);
              if(!customerPurchaseIndex.has(customerName)) {
                customerPurchaseIndex.set(customerName,[]);
              }

              // push to customerPurchaseIndex
              let timeStampsArr = customerPurchaseIndex.get(customerName)
              if(!timeStampsArr.includes(timestamps)) {
                timeStampsArr.push(timestamps);
              }
              // push the new timestamps into orderTimeStamps if it doesn't exist yet
              if(!orderTimeStamps.includes(timestamps)) {
                orderTimeStamps.push(timestamps);
              }
            }
          }
          orderTimeStamps.sort((a,b) => a-b); // sort in ascending order (chronological)
          await t.commit();

          console.log('Successfully init order purchase');
        } catch(e) {
          console.log(e);
          await t.rollback();
          throw e;
        }
      },
      /**
        Object timestamps:
         object action
         customer name
      // actionCustomerIndex:
         map action
         set timestamps (faster add and retrieval)
      */
      async initCustomerHistory() {
        const t = await database.sequelize.transaction();
        try {
          const actions = await database.action.findAll({where:{[Op.or]: [{action:'new'}, {action:'update'},{action:'delete'}]}},{transaction:t});
          for(let action of actions) {
            let customers = await action.getCustomers({transaction:t});
            let actionName = await action.get('action', {transaction:t});
            for(let customer of customers) {
              let timestamps = await customer.customer_transaction.get('timestamps',{transaction:t});
              let customerName = await customer.get('name',{transaction:t});

              if(typeof customerHistory[timestamps] === 'undefined') {
                customerHistory[timestamps] = new Object();
              }
              if(typeof customerHistory[timestamps][actionName] === 'undefined') {
                customerHistory[timestamps][actionName] = new Object();
              }
              if(!(customerHistory[timestamps][actionName] instanceof Array)){
                customerHistory[timestamps][actionName] = [];
              }
              customerHistory[timestamps][actionName].push({timestamps,actionName,customerName});
              if(!actionCustomerIndex.has(actionName)){
                actionCustomerIndex.set(actionName,new Set());
              }
              if(!customerHistoryTimeStamps.includes(timestamps)) {
                customerHistoryTimeStamps.push(timestamps);
              }
              actionCustomerIndex.get(actionName).add(timestamps);
            }
          }
          customerHistoryTimeStamps.sort((a,b) => a-b); // sort the timestamps ascending order
          await t.commit();
          console.log('init customer history successful');
        } catch(e) {
          console.log(e);
          await t.rollback();
          throw e;
        }
      },

      /**
        productHistory
         object of timestamps
         object of action
         array of productData
         product name, amount, action,
      // actionProductIndex
         map of string action
         set of timestamps as value() because things needs to be distinct
      */
      async initProductHistory() {
        const t = await database.sequelize.transaction();
        try {
          let actions = await database.action.findAll({where:{[Op.or]:[{action:'new'},{action:'restock'},{action:'delete'}]}},{transaction:t});
          for(let action of actions) {
            let products = await action.getProducts({transaction:t});
            let actionName = await action.get('action',{transaction:t});
            for(let product of products) {
              let timestamps = await product.product_transaction_history.get('timestamps',{transaction:t});
              let quantity = await product.product_transaction_history.get('quantity',{transaction:t});
              let productCode = await product.get('code',{transaction:t});
              let productData = {
                timestamps,
                quantity,
                code:productCode,
                action:actionName
              }
              if(typeof productHistory[timestamps] === 'undefined') {
                productHistory[timestamps] = new Object();
              }
              if(typeof productHistory[timestamps][actionName] === 'undefined') {
                productHistory[timestamps][actionName] = new Object();
              }
              if(!(productHistory[timestamps][actionName] instanceof Array)){
                productHistory[timestamps][actionName] = [];
              }
              productHistory[timestamps][actionName].push(productData);
              if(!actionProductIndex.has(actionName)){
                actionProductIndex.set(actionName,new Set());
              }
              if(!productHistoryTimeStamps.includes(timestamps)) {
                productHistoryTimeStamps.push(timestamps);
              }
              actionProductIndex.get(actionName).add(timestamps);
            }
          }
          productHistoryTimeStamps.sort((a,b) => a-b);
          await t.commit();
          console.log('Successful init product history');
        } catch(e) {
          console.log(e);
          await t.rollback();
          throw e;
        }
      },

      /**
         get Customer History Detail based on Date, and Action
         divide into date
         divide into action
         getting customerHistory, actionCustomerIndex, customerHistoryTimeStamps
        ///////// Getting Raw Data //////////////////////
         1. filter customerHistoryTimeStamps to begin and end timestamps
         2. Find the Timestamps in customerHistory
         3. store it into the obj array for the raw data

        ///////// Getting Based Action ///////////////////
         1. Filter Array of timestamps based on begin and end timestamps given
         2. Search through customerHistory for timestamps and action given
         3. Store it into the obj array based on action
         return [basedDate,basedSale]
      */
      async getCustomerHistoryDetail(beginMonth=1,beginYear=2018, endMonth=beginMonth+1,endYear=beginYear) {
        try {
          if(beginMonth > 12 || beginMonth < 0 || endMonth > 12 || endMonth <= 0) {
            throw new Error('You insert either the wrong startMonth or endMonth argument');
          }
          let beginTimestamps = moment(`${beginYear} ${beginMonth}`, 'YYYY MM').valueOf();
          let endTimestamps = moment(`${endYear} ${endMonth}`, 'YYYY MM').valueOf();
          let range = customerHistoryTimeStamps.filter((timestamps) => timestamps >= beginTimestamps && timestamps < endTimestamps);
          let basedDate = [];
          range.forEach((timestamps) => {
            Object.keys(customerHistory[timestamps]).forEach((action) => {
              basedDate = [...basedDate,...customerHistory[timestamps][action]];
            });
          });
          // per sale
          let basedAction = [];
          actionCustomerIndex.forEach((val,key) => {
            range.forEach((timestamps) => {
              // basedAction = [...basedAction, ...customerHistory[timestamps][key]];
              basedSale.push(...customerHistory[timestamps][key])
            });
          });
          return [basedDate,basedAction];
        }catch (e) {
          console.log(e);
          throw e;
        }
      },

      /* get all the Product History detail based on Date, and Action
       get all Product History based on Date, Action
       divide into dateBased
       divide into actionBased
       productHistory, actionProductIndex, productHistoryTimeStamps
      ///// Getting Raw Data (date Based) /////////////
       1. filter productHistoryTimeStamps to the begin and end given
       2. Iterate through productHistory
       3. Store it into dateBased of objArr

      ///// Getting Based Action (action Based) //////////
       1. iterating through key of actionProductIndex
       2. through the filter productHistory, push the value to the actionBased

       return [dateBased, actionBased]
      */
      async getProductHistoryDetail(beginMonth=01,beginYear=2018,endMonth=beginMonth+1,endYear=beginYear) {
        try {
          if(beginMonth > 12 || beginMonth < 0 || endMonth > 12 || endMonth <= 0) {
            throw new Error('You insert either the wrong startMonth or endMonth argument');
          }
          let beginTimestamps = moment(`${beginYear} ${beginMonth}`, 'YYYY MM').valueOf();
          let endTimestamps = moment(`${endYear} ${endMonth}`, 'YYYY MM').valueOf();
          let range = productHistoryTimeStamps.filter((timestamps) => timestamps >= beginTimestamps && timestamps < endTimestamps);
          let dateBased = [];
          range.forEach((timestamps) => {
            Object.keys(productHistory[timestamps]).forEach((action) => {
              dateBased = [...dateBased, ...productHistory[timestamps][action]];
            })
          });
          let actionBased = [];
          actionProductIndex.forEach((val,key) => {
            range.forEach((timestamps) => {
              actionBased = [...actionBased,...productHistory[timestamps][key]];
            });
          })
          return [dateBased,actionBased];
        }catch (e) {
          console.log(e);
          throw e;
        }
      },

      /** Get all the purchase detail through month and year
       divide into per customer
       divide into per product
       divide into raw data
       getting purchaseMap, and customerPurchaseIndex
      //////////// Getting Raw Data //////////////////
        1. filter orderTimeStamps based on the begin and end timestamps
        2. get from purchaseMap from orderTimeStamps in timestamps
        3. store it in obj for raw data

      //////////// Getting Based Customer /////////////
       1. deep clone dateBased
       2. sort based on Customer localeCompare

      /////////// Getting Based Product ///////////////
       1. deep clone dateBased
       2. sort based on Product localeCompare

       return [dateBased, customerBased, productBased]
      */
      async getPurchaseDetail(beginMonth=1,beginYear=2018,endMonth=beginMonth+1,endYear=beginYear) {
        try {
          if(beginMonth > 12 || beginMonth < 0 || endMonth > 12 || endMonth <= 0) {
            throw new Error('You insert either the wrong startMonth or endMonth argument');
          }
          let startTimestamps  = moment(`${beginYear} ${beginMonth}`, 'YYYY MM');
          let endTimestamps = moment(`${endYear} ${endMonth}`, 'YYYY MM');
          let range = orderTimeStamps.filter(timestamps => timestamps >= startTimestamps && timestamps < endTimestamps);
          // per date
          let dateBased = [];
          range.forEach((timestamps) => {
            dateBased = [...dateBased,...purchaseMap.get(timestamps)];
          });
          // per customer
          let customerBased = JSON.parse(JSON.stringify(Object.assign([], dateBased))); // to deep clone, because src reference to an obj, it only copies that reference value
          customerBased.sort((a,b) => a.customer.localeCompare(b.customer));
          // per product
          let productBased = JSON.parse(JSON.stringify(Object.assign([],dateBased)));
          productBased.sort((a,b) => a.code.localeCompare(b.code));
          return [dateBased,customerBased,productBased];
        } catch(e) {
          console.log(e);
          throw e;
        }
      },

      /**
        getCustomerPurchaseDetail
        Get all purchaseBased Customer
        DS: customerPurchaseIndex, purchasMap

        1. get timestamps from customerPurchaseIndex
        2. get obj from purchaseMap associate with the customer

        return [{obj}]
      */
      async getCustomerPurchaseDetail(customer='Other'){
        try {
          let timestamps_arr = customerPurchaseIndex.get(customer);
          if(typeof timestamps_arr === 'undefined') throw 'Customer does not have any Transaction Detail';
          let data = [];
          console.log(timestamps_arr);
          timestamps_arr.forEach((timestamp) => {
            data = [...data, ...purchaseMap.get(timestamp)];
          });
          return data;
        } catch(e) {
          throw new Error(e);
        }
      },

      /**
        getProductHistory
        Get all productHistory Based on sales
        DS: productHistory, actionProductIndex

        1. Get timestamps from actionProductIndex (array of timeStamps)
        2. get all the timestamps from the productHistory Object and action and put it into
        an object
        3. All product that is that actionName

        return [{obj}]
      */
      async getProductHistory(actionName='new') {
        try {
          if(!actionProductIndex.has(actionName)) throw 'action name doesn\'t exist'
          let timestamps = actionProductIndex.get(actionName);
          let data = [];
          timestamps.forEach((timestamp) => {
            data = [...data,...productHistory[timestamp][actionName]];
          });

          return data;
        } catch(e) {
          console.log(e);
          throw new Error(e);
        }

      },

      /**
        TODO: Get all specific product History
      */
      async getProductSpecificHistory(code) {

      },

      /**
        TODO: Get all customerHistory Based on Sales
      */
      async getCustomerHistory(actionName) {

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
