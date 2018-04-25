let {ipcMain} = require('electron');
let db = require('../../db.js');
let lunr = require('lunr');

ipcMain.on('show', async (event, data) => {
  try {
    // do full-text search here
    const products = await db.product.all();
    let docToIndex = products.map((product) => {
      return {
        id: product.get('id'),
        code: product.get('code'),
        quantity:product.get('quantity'),
        price:product.get('price'),
        brand:product.get('brand')
      }
    });

    event.sender.send('reply-show', {status: 'OK', message: docToIndex});
  } catch(e) {
    event.sender.send('reply-show', {status: 'Error', message:'Error on showing'});
  }
});
