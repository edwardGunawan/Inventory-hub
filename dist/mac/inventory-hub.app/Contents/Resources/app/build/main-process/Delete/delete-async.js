let {ipcMain} = require('electron');
let db = require('../../db.js');
const libInstance = require('../Helper/lib.js')({database:db});
/**
  DELETE
  Customer or Product
  where format:
  let destroy_customer = {name:['Toko Pedia','Toko Sinarmata']};
  let destroy_product={code:['Product3']};
  */
ipcMain.on('delete', async (evt,data) => {
  try {
    let {input_arr,category} = data;
    let attr = (category === 'customer') ? 'name' : 'code';
    let delete_obj = {[attr]: input_arr.map((input) => {
      if(category === 'customer') {
        return input.name
      }else {
        return input.code
      }
    })};
    await libInstance.delete(delete_obj,category);
    evt.sender.send('reply-delete',{status:'OK',message:`${category} has been deleted`})
  } catch(e) {
    console.log(e, 'error in delete-async.js');
    evt.sender.send('reply-delete',{status:'Error', message:e});
    throw e;
  }
});
