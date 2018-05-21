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
          const orders = await database.purchaseOrder.findAll({
            order:[['timestamps','ASC']],
            include:[
              {
                model:database.customer,
                attributes:['name'],
                required:true
              },
              {
                model: database.product,
                attributes:['code','brand','price'],
                required:true,
                include:[
                  {model:database.purchaseDetail,attributes:['quantity','totalPricePerItem']}
                ]
              },
              {
                model:database.action,
                attributes:['action'],
                required:true
              }
            ]},
            {transaction:t});
            // console.log(orders);
          // // const orders = await database.purchaseDetail.findAll({include:[{model:database.purchaseOrder},{model:database.product}]},{transaction:t});
          for(let order of orders) {
            let productData = {}
            let products = await order.get('products',{transaction:t});
            let timestamps = await order.get('timestamps',{transaction:t});
            let discount = await order.get('discount',{transaction:t});
            let customer = await order.get('customer',{transaction:t});
            let customerName = await customer.get('name',{transaction:t});
            let action = await order.get('action',{transaction:t});
            let actionName = await action.get('action',{transaction:t});
            for(let product of products) {
              let code = await product.get('code',{transaction:t});
              let brand = await product.get('brand',{transaction:t});
              let price = await product.get('price',{transaction:t});
              let purchaseDetail = await product.get('purchase_detail',{transaction:t});
              let quantity = await purchaseDetail.get('quantity',{transaction:t});
              let subTotal = await purchaseDetail.get('totalPricePerItem',{transaction:t});
              productData = {
                date: moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),
                customer: customerName,
                discount,
                action: actionName,
                code,
                brand,
                quantity,
                price,
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
          const histories = await database.customerTransactionHistory.findAll({
            attributes:['timestamps'],
            order:[['timestamps','ASC']],
            include:[
              {
                model:database.customer,
                attributes:['name'],
                required:true
              },
              {
                model:database.action,
                attributes:['action'],
                required:true
              }
            ]
          },{transaction:t});

          for(let history of histories) {
            let timestamps = await history.get('timestamps',{transaction:t});
            let customer = await history.get('customer',{transaction:t});
            let customerName = await customer.get('name',{transaction:t});
            let action = await history.get('action', {transaction:t});
            let actionName = await action.get('action',{transaction:t});

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
          let histories = await database.productTransactionHistory.findAll({order:[['timestamps','ASC']],include:[database.action,database.product]},{transaction:t});
          for(let history of histories ) {
            let product = await history.get('product', {transaction:t});
            let code = await product.get('code',{transaction:t});
            let action = await history.get('action', {transaction:t});
            let actionName = await action.get('action',{transaction:t});
            let timestamps = await history.get('timestamps', {transaction:t});
            let quantity = await history.get('quantity', {transaction:t});
            let productData = {
              timestamps,
              quantity,
              code,
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

          productHistoryTimeStamps.sort((a,b) => a-b);
          await t.commit();
          console.log('Successful init product history');
        } catch(e) {
          console.log(e);
          await t.rollback();
          throw new Error(e);
        }
      },

      /**
         get Customer History Detail based on Date
         divide into date
         return basedDate
      */
      async getCustomerHistoryDetail(beginMonth=1,beginYear=2018, endMonth=beginMonth+1,endYear=beginYear) {
        const t = await database.sequelize.transaction();
        try {
          if(beginMonth > 12 || beginMonth < 0 || endMonth > 12 || endMonth <= 0) {
            throw new Error('You insert either the wrong startMonth or endMonth argument');
          }
          // // per sale
          let basedDate = [];
          let beginTimestamps = moment(`${beginYear} ${beginMonth}`, 'YYYY MM').valueOf();
          let endTimestamps = moment(`${endYear} ${endMonth}`, 'YYYY MM').valueOf();
          let histories = await database.customerTransactionHistory.findAll({
            where:{
              timestamps: {
                [Op.lt]: endTimestamps,
                [Op.gt]: beginTimestamps
              }
            },
            attributes:['timestamps'],
            order:[['timestamps','ASC']],
            include:[
              {model:database.customer,attributes:['name']},
              {model:database.action, attributes:['action']}
            ]
          }, {transaction:t});

          for(let history of histories) {
            // console.log(history);
            let timestamps = await history.get('timestamps',{transaction:t});
            let customer = await history.get('customer',{transaction:t});
            let customerName = await customer.get('name',{transaction:t});
            let action = await history.get('action',{transaction:t});
            let actionName = await action.get('action',{transaction:t});
            basedDate = [...basedDate,{timestamps:moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),customerName,action:actionName}]
          }
          await t.commit();
          return basedDate;
        }catch (e) {
          console.log(e);
          await t.rollback();
          throw e;
        }
      },

      /*
        get all the Product History detail based on Date
        divide into dateBased
        return dateBased
      */
      async getProductHistoryDetail(beginMonth=01,beginYear=2018,endMonth=beginMonth+1,endYear=beginYear) {
        const t = await database.sequelize.transaction();
        try {
          if(beginMonth > 12 || beginMonth < 0 || endMonth > 12 || endMonth <= 0) {
            throw new Error('You insert either the wrong startMonth or endMonth argument');
          }
          let beginTimestamps = moment(`${beginYear} ${beginMonth}`, 'YYYY MM').valueOf();
          let endTimestamps = moment(`${endYear} ${endMonth}`, 'YYYY MM').valueOf();

          // let range = productHistoryTimeStamps.filter((timestamps) => timestamps >= beginTimestamps && timestamps < endTimestamps);
          let dateBased = [];
          let histories = await database.productTransactionHistory.findAll({
            where:{
              timestamps:{
                [Op.lt]:endTimestamps,
                [Op.gt]:beginTimestamps
              }
            },
            attributes:['timestamps','quantity'],
            order:[['timestamps','ASC']],
            include:[
              {model:database.action,attributes:['action']},
              {model:database.product,attributes:['code']}
            ]
          },{transaction:t});
          for(let history of histories) {
            let timestamps = await history.get('timestamps',{transaction:t});
            let quantity = await history.get('quantity',{transaction:t});
            let product = await history.get('product',{transaction:t});
            let code = await product.get('code',{transaction:t});
            let action = await history.get('action',{transaction:t});
            let actionName = await action.get('action',{transaction:t});
            dateBased = [...dateBased,{timestamps:moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),quantity,code,action:actionName}];
          }
          await t.commit();
          return dateBased;
        }catch (e) {
          console.log(e);
          await t.rollback();
          throw e;
        }
      },

      /**
      Get all the purchase detail through month and year
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
        const t = await database.sequelize.transaction();
        try {
          if(beginMonth > 12 || beginMonth < 0 || endMonth > 12 || endMonth <= 0) {
            throw new Error('You insert either the wrong startMonth or endMonth argument');
          }
          let startTimestamps  = moment(`${beginYear} ${beginMonth}`, 'YYYY MM').valueOf();
          let endTimestamps = moment(`${endYear} ${endMonth}`, 'YYYY MM').valueOf();
          // per date
          let dateBased = [];
          let orders = await database.purchaseOrder.findAll({
            where:{
              timestamps:{
                [Op.lt]: endTimestamps,
                [Op.gt]: startTimestamps
              }
            },
            order:[['timestamps','ASC']],
            attributes:['timestamps','discount','totalPrice'],
            include:[
              {
                model:database.customer,
                attributes:['name']
              },{
                model:database.action,
                attributes:['action']
              },{
                model:database.product,
                attributes:['code','brand'],
                include:[
                  {model:database.purchaseDetail,attributes:['quantity','totalPricePerItem']}
                ]
              }
            ]
          },{transaction:t});
          for(let order of orders) {
            let timestamps = await order.get('timestamps',{transaction:t});
            let discount = await order.get('discount',{transaction:t});
            let products = await order.get('products',{transaction:t});
            let customer = await order.get('customer',{transaction:t});
            let customerName = await customer.get('name',{transaction:t});
            let action = await order.get('action',{transaction:t});
            let actionName = await action.get('action',{transaction:t});
            for(let product of products) {
              let price = await product.get('price',{transaction:t});
              let code = await product.get('code',{transaction:t});
              let brand = await product.get('brand',{transaction:t});
              let detail = await product.get('purchase_detail',{transaction:t});
              let quantity = await detail.get('quantity',{transaction:t});
              let subTotal = await detail.get('totalPricePerItem',{transaction:t});
              dateBased.push({
                date: moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),
                customer: customerName,
                discount,
                action: actionName,
                code,
                brand,
                quantity,
                price,
                subTotal
              });
            }
          }
          // per customer
          let customerBased = JSON.parse(JSON.stringify(Object.assign([], dateBased))); // to deep clone, because src reference to an obj, it only copies that reference value
          customerBased.sort((a,b) => a.customer.localeCompare(b.customer));
          // per product
          let productBased = JSON.parse(JSON.stringify(Object.assign([],dateBased)));
          productBased.sort((a,b) => a.code.localeCompare(b.code));
          await t.commit();
          return [dateBased,customerBased,productBased];
        } catch(e) {
          console.log(e);
          await t.rollback();
          throw e;
        }
      },

      /**
        getCustomerPurchaseDetail
        Get all purchaseBased Customer
        DS: customerPurchaseIndex, purchasMap

        return [{timestamps,code,brand,quantity,subTotal,action}]
      */
      async getCustomerPurchaseDetail(name='Other'){
        const t = await database.sequelize.transaction();
        try {
          let data = [];
          let customer = await database.customer.findOne({
            where:{
              name
            },
            attributes:['name'],
            include:[
              {
                model:database.purchaseOrder,
                attributes:['totalPrice','timestamps'],
                order:[['timestamps','ASC']],
                include:[
                  {
                    model:database.purchaseDetail,
                    attributes:['quantity','totalPricePerItem'],
                    include:[{model:database.product,attributes:['code','brand']}]
                  },{
                    model:database.action,
                    attributes:['action']
                  }
                ]
              }
            ]
          },{transaction:t})
          const orders = await customer.get('purchase_orders',{transaction:t});
          for(let order of orders) {
            let timestamps = await order.get('timestamps',{transaction:t});
            let details = await order.get('purchase_details',{transaction:t});
            let action = await order.get('action',{transaction:t});
            let actionName = await action.get('action',{transaction:t});
            for(let detail of details){
              let subTotal = await detail.get('totalPricePerItem',{transaction:t});
              let quantity = await detail.get('quantity',{transaction:t});
              let product = await detail.get('product',{transaction:t});
              let code = await product.get('code',{transaction:t});
              let brand = await product.get('brand',{transaction:t});
              data.push({
                timestamps:moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),
                code,
                brand,
                quantity,
                subTotal,
                action:actionName,
              });
            }
          }
          await t.commit();
          return data;
        } catch(e) {
          await t.rollback();
          throw new Error(e);
        }
      },
      /**
        getProudctPurchaseDetail:
          getting all purchase history of that product code name
          return [{timestamps,brand,quantity,price,subTotal,action,customer}]
      */
      async getProductPurchaseDetail(code='') {
        const t = await database.sequelize.transaction();
        try {
          const product = await database.product.findOne({
            where:{code},
            attribute:['brand','price'],
            include:[
              {
                model: database.purchaseDetail,
                attributes:['quantity','totalPricePerItem'],
                include:[
                  {model:database.purchaseOrder,attributes:['timestamps'],order:[['timestamps','ASC']],include:[database.action,database.customer]}
                ]
              }
            ]
          },{transaction:t});
          let data = [];
          let brand = await product.get('brand',{transaction:t});
          let price = await product.get('price',{transaction:t});
          let details = await product.get('purchase_details',{transaction:t});
          for(let detail of details) {
            let quantity = await detail.get('quantity',{transaction:t});
            let subTotal = await detail.get('totalPricePerItem',{transaction:t});
            let order = await detail.get('purchase_order',{transaction:t});
            let timestamps = await order.get('timestamps',{transaction:t});
            let action = await order.get('action',{transaction:t});
            let actionName = await action.get('action',{transaction:t});
            let customer = await order.get('customer',{transaction:t});
            let customerName = await customer.get('name',{transaction:t});
            data.push({
              timestamps:moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),
              brand,
              quantity,
              price,
              subTotal,
              action:actionName,
              customer:customerName
            });
          }
          await t.commit();
          return data;
        }catch(e) {
          await t.rollback();
          throw new Error(e);
        }
      },

      /**
        getBrandPurchaseDetail
        getting all product based on the brand and return all its purchase history
        return [{timestamps,code,quantity,action,subTotal,customerprice}]
        */
        async getBrandPurchaseDetail(brand='') {
          const t = await database.sequelize.transaction();
          try {
            const product = await database.product.findOne({
              where:{brand},
              attribute:['code','price'],
              include:[
                {
                  model: database.purchaseDetail,
                  attributes:['quantity','totalPricePerItem'],
                  include:[
                    {model:database.purchaseOrder,attributes:['timestamps'],order:[['timestamps','ASC']],include:[database.action,database.customer]}
                  ]
                }
              ]
            },{transaction:t});
            let data = [];
            let code = await product.get('code',{transaction:t});
            let price = await product.get('price',{transaction:t});
            let details = await product.get('purchase_details',{transaction:t});
            for(let detail of details) {
              let quantity = await detail.get('quantity',{transaction:t});
              let subTotal = await detail.get('totalPricePerItem',{transaction:t});
              let order = await detail.get('purchase_order',{transaction:t});
              let timestamps = await order.get('timestamps',{transaction:t});
              let action = await order.get('action',{transaction:t});
              let actionName = await action.get('action',{transaction:t});
              let customer = await order.get('customer',{transaction:t});
              let customerName = await customer.get('name',{transaction:t});
              data.push({
                timestamps:moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),
                code,
                quantity,
                price,
                subTotal,
                action:actionName,
                customer:customerName
              });
            }
            await t.commit();
            return data;
          }catch(e) {
            await t.rollback();
            throw new Error(e);
          }
        },
      /**
        getProductHistory
        Get all productHistory Based on sales
        return [{timestamps,code,quantity}]
      */
      async getProductHistory(actionName='new') {
        const t = await database.sequelize.transaction();
        try {
          const action = await database.action.findOne({
            where:{
              action:actionName.toLowerCase()
            },
            attributes:['action'],
            include:[
              {
                model:database.productTransactionHistory,
                order:[['timestamps','ASC']],
                attributes:['timestamps','quantity'],
                include:[
                  {
                    model:database.product,
                    attributes:['code']
                  }
                ]
              }
            ]
          },{transaction:t});
          let data = [];
          let histories = await action.get('product_transaction_histories',{transaction:t});
          // console.log(histories);
          for(let history of histories) {
            let timestamps = await history.get('timestamps',{transaction:t});
            let quantity = await history.get('quantity',{transaction:t});
            let product = await history.get('product',{transaction:t});
            let code = await product.get('code',{transaction:t});
            data = [...data,{timestamps:moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),code,quantity}];
          }
          await t.commit();
          return data;
        } catch(e) {
          console.log(e);
          await t.rollback();
          throw new Error(e);
        }
      },

      /**
        Get all specific product History
        1. get product db in database
        2. getActions for all the action in the product
        object of code,quantity,action, timestamps
        return [{obj}]
      */
      async getProductSpecificHistory(code='') {
        const t = await database.sequelize.transaction();
        try {
          if(!code) throw 'code is empty';
          const product = await database.product.findOne({
            where:{code},
            attributes:['code','brand'],
            include:[{
              model:database.productTransactionHistory,
              attributes:['timestamps','quantity'],
              order:[['timestamps','ASC'],['quantity','ASC']],
              required:true,
              // through:{attributes:[]}  // this will get rid of the intermediary table
              include:[{
                model:database.action,
                attributes:['action'],
                required:true
              }]
            }
          ]},
          {transaction:t}
        );
        // console.log('histories',product.get('product_transaction_histories'));
        let data = [];
        let histories = await product.get('product_transaction_histories',{transaction:t});
        for(let history of histories) {
          let quantity = await history.get('quantity',{transaction:t});
          let timestamps = await history.get('timestamps',{transaction:t});
          let action = await history.get('action',{transaction:t});
          let actionName = await action.get('action',{transaction:t});
          data.push({
            timestamps:moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),
            code,
            action:actionName,
            quantity
          });
        }
        await t.commit();
        return data;
        } catch(e) {
          console.log(e);
          await t.rollback();
          throw new Error(e);
        }
      },

      /**
        Get all customerHistory Based on Sales
        return [{timestamps,customername}]
      */
      async getCustomerHistory(actionName='new') {
        const t = await database.sequelize.transaction();
        try {
          let data =[];
          let action = await database.action.findOne({
            where:{
              action:actionName.toLowerCase()
            },
            include:[
              {
                model:database.customerTransactionHistory,
                attributes:['timestamps'],
                order:[['timestamps','ASC']],
                include:[
                  {
                    model:database.customer,
                    attribute:['name']
                  }
                ]
              }
            ]
          },{transaction:t});
          let histories = await action.get('customer_transactions',{transaction:t});
          for(let history of histories) {
            let timestamps = await history.get('timestamps',{transaction:t});
            let customer = await history.get('customer',{transaction:t});
            let name = await customer.get('name',{transaction:t});
            data.push({timestamps:moment.utc(timestamps).local().format('YYYY/MM/DD/HH:mm'),name});
          }
          await t.commit();
          return data;
        }catch(e) {
          console.log(e);
          await t.rollback();
          throw new Error(e);
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
