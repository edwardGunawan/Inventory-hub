let {ipcMain} = require('electron');
let db = require('../../db.js');


/*
  Edit/ Update product based on attribute
  incoming data will be id and attribute object
*/
ipcMain.on('edit', async (event,data) => {
  try {
    let {id, attribute} = data;
    let needToUpdate = await db.product.findOne({ where:{ id } });
    let newProd = await needToUpdate.update(attribute);
    event.sender.send('reply-edit',{status:'OK', message:newProd.get('code')});
  }catch (e) {
    event.sender.send('reply-edit',{status:'Error', message:e});
  }
});
