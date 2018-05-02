const {ipcMain} = require('electron');
const pdfInvoice = require('./pdfConvert.js');

ipcMain.on('convert-pdf', (evt,data) => {
  let {items,discount,customer,action} = data;
  console.log(data);
  console.log(items, ' items in convert-pdf');
  //TODO: converting to the invoice item format
  // convert to the invoice(document, send it to the frontend)
  // Document render then when people clikc print pdf, run purchase
  // pipe it to download dir
  let document = pdfInvoice({
    company: {
      phone:'(99)-999-9999',
      email: 'company@evilcorp.com',
       address: 'Av. Companhia, 182, Água Branca, Piauí',
       name: 'Evil Corp.',
     },
     customer: {
       name:customer,
       email: '',
     },
     items,
     discount,
     action
  });
  const fs = require('fs')

  console.log('document has been converted');

  let currDate = new Date();
  let month = currDate.getMonth();
  let day = currDate.getDay();
  let time = currDate.getTime();
  let year = currDate.getFullYear();
  document.generate();
  document.pdfkitDoc.pipe(fs.createWriteStream(__dirname+`/invoice-${time}-${day}-${month}-${year}.pdf`));
  evt.sender.send('reply-convert-pdf', {status:'OK', message:'pdf is printed'});
});
