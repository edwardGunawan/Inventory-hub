const pdfInvoice = require('../Helper/pdfConvert.js');

const document = pdfInvoice({
  company: {
    phone: '(99) 9 9999-9999',
    email: 'company@evilcorp.com',
    address: 'Av. Companhia, 182, Água Branca, Piauí',
    name: 'Evil Corp.',
  },
  customer: {
    name: 'Elliot Raque',
    email: 'raque@gmail.com',
  },
  items: [
    {price: 50.0, code: 'XYZ', quantity: 12, brand:'SamCafaso',total:1000},
    {price: 12.0, code: 'ABC', quantity: 12, brand:'SamCafaso',total:1000},
    {price: 127.72, code: 'DFE', quantity: 12, brand:'SamCafaso',total:1000},
  ],
  discount:20,
  action:'Sold'
})

// That's it! Do whatever you want now.
// Pipe it to a file for instance:

const fs = require('fs')

document.generate() // triggers rendering
// console.log(document.pdfKitDoc);
document.pdfkitDoc.pipe(fs.createWriteStream(__dirname+'/my-invoice.pdf'))
