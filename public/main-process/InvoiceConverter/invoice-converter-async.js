const {ipcMain,app} = require('electron');
const pdfInvoice = require('../Helper/pdfConvert.js');
const path = require('path');
require('dotenv').config()
const log = require('electron-log');

log.info('process env name ', process.env.name);
ipcMain.on('convert-pdf', (evt,data) => {
  let {items,discount,customer,action,receiptNum} = data;
  log.info(items, ' items in convert-pdf');

  let document = pdfInvoice({
    company: {
      phone:'(021)-29939014',
       address: 'Senen Jaya Blok IV. Lt.1 - B2 no 12 Jakarta Pusat',
       name: 'Toko CERMERLANG',
     },
     customer: {
       name:customer,
       email: '',
     },
     receiptNum,
     items,
     discount,
     action,
     rekening: {
       number: process.env.BCANUM,
       name: process.env.name
     }
  });
  const fs = require('fs');
  const path = require('path');

  log.info('document has been converted');

  function checkOrCreateDir(path) {
    try {
      fs.statSync(path);
    }catch(e) {
      fs.mkdirSync(path);
    }
  }
  pathToStore = path.join(app.getPath('desktop'),'inventoryInvoice')
  checkOrCreateDir(pathToStore);

  let currDate = new Date();
  let month = currDate.getMonth();
  let day = currDate.getDay();
  let time = currDate.getTime();
  let year = currDate.getFullYear();
  document.generate();
  document.pdfkitDoc.pipe(fs.createWriteStream(path.join(pathToStore,`/invoice-${time}-${day}-${month}-${year}.pdf`)));
  evt.sender.send('reply-convert-pdf', {status:'OK', message:'pdf is printed'});
});
