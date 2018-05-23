const moment = require('moment');
const path = require('path');

function lib({
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

    const Op = database.Sequelize.Op;
    let orderTimeStamps = []; // render all timestamps to the frontend

    let brands = new Set(); // all brand that will be render to the frontend for react select
    let codes = []; // all code that can be render to the frontend

    let customerHistoryTimeStamps = []; // render all timestamps to the frontend
    let productHistoryTimeStamps = []; // render all timestamps to the frontend

    return {
      /**
        createTransaction
        create either product, or customer, and restock
      */
      async createTransaction(input_arr,category) {
        const t = await database.sequelize.transaction();
        try {
          let instances, action,transactionHistory;
          switch(category) {
            case 'product':
              instances = await database.product.bulkCreate(input_arr,{returning:true, transaction:t});
              action = await database.action.findOne({where:{ action: 'new'}}, {transaction:t});
              break;
            case 'customer':
              instances = await database.customer.bulkCreate(input_arr,{returning:true, transaction:t});
              action = await database.action.findOne({where:{ action: 'new'}}, {transaction:t});
              break;
            case 'restock' :
              action = await database.action.findOne({where:{ action: 'restock'}}, {transaction:t});
              for(let {code,brand,quantity,price} of input_arr) {
                let prod = await database.product.findOne({where:{code}}, {transaction:t});
                let actionId = await action.get('action',{transaction:t});
                transactionHistory = await database.productTransactionHistory.create({quantity,code,brand,price},{transaction:t});
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
                let code = await inst.get('code',{transaction:t});
                let price = await inst.get('price',{transaction:t});
                let brand = await inst.get('brand',{transaction:t});
                transactionHistory = await database.productTransactionHistory.create({quantity,code,price,brand},{transaction:t});
                promises.push(inst.addProduct_transaction_history(transactionHistory,{transaction:t})); // product
                promises.push(action.addProduct_transaction_history(transactionHistory,{transaction:t})); // action
              }else {
                let name = await inst.get('name',{transaction:t});
                transactionHistory = await database.customerTransactionHistory.create({name},{transaction:t});
                promises.push(inst.addCustomer_transaction(transactionHistory,{transaction:t})); // customer
                promises.push(action.addCustomer_transaction(transactionHistory,{transaction:t})); // action
              }
            }
            await Promise.all(promises);
          }
          await t.commit();
          console.log('transaction is succeeeded');
        }catch(e) {
          console.log(e);
          await t.rollback();
          throw new Error(e);
        }
      },
      /**
        GET
        customer | product
      **/
      async get(input_arr,category) {
        const t = await database.sequelize.transaction();
        try {
          let data = [];
          switch(category) {
            case 'product':
              let products = await database.product.findAll({where:{deleted:false}});
              data = products.map((product) => {
                return {
                  code: product.get('code'),
                  quantity:  product.get('quantity'),
                  price: product.get('price'),
                  brand: product.get('brand')
                }
              });
              break;
            case 'customer':
              let customers = await database.customer.findAll({where:{deleted:false}});
              data = customers.map((customer) => {
                return customer.get('name');
              });
              break;
          }
          await t.commit();
          return data;
        }catch(e) {
          console.log(e);
          await t.rollback();
          throw new Error(e);
        }
      },
      /**
        update
        bulkUpdate customer for its name
        input_arr = [
          {where: {attr:value}, updates:{attribute:value} }
        ];
        category: product or customer
        */
      async update(input_arr,category){
        const t = await database.sequelize.transaction();
        try {
          let db,transactionHistory;
          switch(category) {
            case 'product':
              db = database.product;
              break;
            case 'customer':
              db = database.customer;
              break;
          }
          let promises = [];
          for(let input of input_arr) {
            let {where,updates} = input;
            let instance = await db.findOne({where},{transaction:t});
            let action = await database.action.findOne({where:{action:'update'}},{transaction:t});
            let updatedInstance = await instance.update(updates,{transaction:t});
            if(category === 'product') {
              let quantity = await updatedInstance.get('quantity',{transaction:t});
              let code = await updatedInstance.get('code',{transaction:t});
              let price = await updatedInstance.get('price',{transaction:t});
              let brand = await updatedInstance.get('brand',{transaction:t});
              transactionHistory = await database.productTransactionHistory.create({quantity,code,price,brand},{transaction:t});
              promises.push(instance.addProduct_transaction_history(transactionHistory,{transaction:t})); // product
              promises.push(action.addProduct_transaction_history(transactionHistory,{transaction:t})); // action
            }else {
              let name = await updatedInstance.get('name',{transaction:t});
              transactionHistory = await database.customerTransactionHistory.create({name},{transaction:t});
              promises.push(instance.addCustomer_transaction(transactionHistory,{transaction:t})); // customer
              promises.push(action.addCustomer_transaction(transactionHistory,{transaction:t})); // action
            }
          }
          await Promise.all(promises);
          await t.commit();
          console.log('finished updating');
        } catch(e) {
          console.log(e);
          await t.rollback();
          throw new Error(e);
        }
      },
      /**
       DELETE Customer/Product
       only put deletedAt to true so all records is still save
       where: {[name:[] | code:[] ]}
       category: customer | product
       */
      async delete(where,category) {
        const t = await database.sequelize.transaction();
        try {
          let db,transactionHistory;
          switch(category) {
            case 'product':
              db = database.product;
              break;
            case 'customer':
              db = database.customer;
              break;
          }
          let numAffectedRows = await db.update({deleted:true},{where},{transaction:t});
          console.log(numAffectedRows);
          if(numAffectedRows.length > 0){
            let allDeletedItems = await db.findAll({where},{transaction:t});
            let action = await database.action.findOne({where:{action:'delete'}},{transaction:t});
            let promises = [];
            for(let item of allDeletedItems) {
              if(category === 'product') {
                let code = await item.get('code',{transaction:t});
                let brand = await item.get('brand',{transaction:t});
                let price = await item.get('price',{transaction:t});
                let quantity = await item.get('quantity',{transaction:t});
                let prodTransaction = await database.productTransactionHistory.create({code,brand,price,quantity},{transaction:t});
                promises.push(action.addProduct_transaction_history(prodTransaction,{transaction:t}));
                promises.push(item.addProduct_transaction_history(prodTransaction,{transaction:t}));
              }
              else {
                let name = await item.get('name',{transaction:t});
                let customerTransaction = await database.customerTransactionHistory.create({name},{transaction:t});
                promises.push(action.addCustomer_transaction(customerTransaction,{transaction:t}));
                promises.push(item.addCustomer_transaction(customerTransaction,{transaction:t}));
              }
            }
            await Promise.all(promises);
          }
          await t.commit();
          return numAffectedRows;
        } catch(e) {
          console.log(e);
          await t.rollback();
          throw new Error(e);
        }
      },
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
      async purchaseOrder({customer, productArr,discount,action,totalPrice}){
        const t = await database.sequelize.transaction();
        try {
          // console.log(moment().valueOf());
          const order = await database.purchaseOrder.create({discount,totalPrice,timestamps:moment().valueOf()}, {transaction:t});
          const actionInst = await database.action.findOne({where:{action}},{transaction:t});
          const customerInst = await database.customer.findOne({where:{name:customer}}, {transaction:t});

          // this is the correct based on what you write on your define method
          await actionInst.addPurchase_order(order,{transaction:t});
          await customerInst.addPurchase_order(order,{transaction:t});

          for(let {brand, code, price, quantity, total} of productArr) {
            let product = await database.product.findOne({where:{code}},{transaction:t});
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
          throw new Error(e);
        }
      },

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
            orderTimeStamps: orderTimeStamps,
            customerHistoryTimeStamps,
            productHistoryTimeStamps,
            brands,
            codes
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
              include:[{model:database.customer,attributes:['deleted']}]
            },
            {transaction:t});
          for(let order of orders) {
            let timestamps = await order.get('timestamps',{transaction:t});
            let customer = await order.get('customer',{transaction:t});
            let deleted = await customer.get('deleted',{transaction:t});
            // push the new timestamps into orderTimeStamps if it doesn't exist yet
            if(!deleted && !orderTimeStamps.includes(timestamps)) {
              orderTimeStamps.push(timestamps);
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
         NOTE: User should still be able to see which product is deleted through the history, so it will still render
         all item included the delted ones
      */
      async initCustomerHistory() {
        const t = await database.sequelize.transaction();
        try {
          const histories = await database.customerTransactionHistory.findAll({
            attributes:['timestamps'],order:[['timestamps','ASC']] },{transaction:t});

          for(let history of histories) {
            let timestamps = await history.get('timestamps',{transaction:t});
            if(!customerHistoryTimeStamps.includes(timestamps)) {
              customerHistoryTimeStamps.push(timestamps);
            }
          }
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
         NOTE : User should still be able to get all produt history including
         the deleted ones
      */
      async initProductHistory() {
        const t = await database.sequelize.transaction();
        try {
          let histories = await database.productTransactionHistory.findAll({order:[['timestamps','ASC']],include:[database.action,database.product]},{transaction:t});
          for(let history of histories ) {
            let product = await history.get('product', {transaction:t});
            let code = await product.get('code',{transaction:t});
            let brand = await product.get('brand',{transaction:t});
            let timestamps = await history.get('timestamps', {transaction:t});

            if(!productHistoryTimeStamps.includes(timestamps)) {
              productHistoryTimeStamps.push(timestamps);
            }
            codes.push(code);
            brands.add(brand);

          }
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


module.exports = lib;
