let {ipcMain} = require('electron');
let db = require('../../db.js');
let lunr = require('lunr');

ipcMain.on('search', async (event, data) => {
  // try {
    // // do full-text search here
    // const products = await db.product.all();
    // let docToIndex = products.map((product) => {
    //   return {
    //     id: product.get('id'),
    //     code: product.get('code'),
    //     amount:product.get('amount'),
    //     price:product.get('price')
    //   }
    // });
    //
    // let idx = lunr(function () {
    //   this.ref('id')
    //   this.field('code')
    //   this.field('amount')
    //   this.field('price')
    //
    //   docToIndex.forEach(function(doc) {
    //       this.add(doc);
    //   },this);
    // })

    // event.sender.send('reply-search', )
  // }

});
