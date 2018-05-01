// const pdfInvoice = require('./pdfConvert.js');
//
// const document = pdfInvoice({
//   company: {
//     phone: '(99) 9 9999-9999',
//     email: 'company@evilcorp.com',
//     address: 'Av. Companhia, 182, Água Branca, Piauí',
//     name: 'Evil Corp.',
//   },
//   customer: {
//     name: 'Elliot Raque',
//     email: 'raque@gmail.com',
//   },
//   items: [
//     {amount: 50.0, name: 'XYZ', description: 'Lorem ipsum dollor sit amet', quantity: 12, brand:'SamCafaso'},
//     {amount: 12.0, name: 'ABC', description: 'Lorem ipsum dollor sit amet', quantity: 12, brand:'SamCafaso'},
//     {amount: 127.72, name: 'DFE', description: 'Lorem ipsum dollor sit amet', quantity: 12, brand:'SamCafaso'},
//   ],
// })
//
// // That's it! Do whatever you want now.
// // Pipe it to a file for instance:
//
// const fs = require('fs')
//
// document.generate() // triggers rendering
// // console.log(document.pdfKitDoc);
// document.pdfkitDoc.pipe(fs.createWriteStream('./main-process/InvoiceConverter/invoice.pdf'))
