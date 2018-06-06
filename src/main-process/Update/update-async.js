let {ipcMain} = require('electron');
let db = require('../../db.js');
const libInstance = require('../Helper/lib.js')({database:db});


/*
  Edit/ Update product based on attribute
  incoming data will be id and attribute object

  let update_arr_customer = [
     {where:{name:'Customer1'},updates:{name: 'Toko Sinarmata'}},
     {where:{name:'Customer2'}, updates:{name:'Toko Pedia'}}
   ];
  let update_arr_product = [
   {where:{code:'Product1'},updates:{brand:'Movado',price:'12'}},
   {where:{code:'Product2'},updates:{brand:'Rolex',price:'1000'}}
  ];
*/
ipcMain.on('update', async (event,data) => {
  try {
    let {input_arr,category} = data;
    let update_arr = input_arr.map((input) => {
      if(category === 'customer') {
        let {name,change} = input;
        return { where:{name},updates:{name:change} }
      }else {
        let {code,brand,price,quantity} = input;
        return { where:{code},updates:{brand,price,quantity} }
      }
    });
    await libInstance.update(update_arr,category);
    event.sender.send('reply-update',{status:'OK', message:`Finish updating ${category}` });
  }catch (e) {
    event.sender.send('reply-update',{status:'Error', message:e});
    throw e;
  }
});
