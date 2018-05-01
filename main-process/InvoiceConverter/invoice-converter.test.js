const pdfInvoice = require('./pdfConvert.js');

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
    {price: 50.0, name: 'XYZ', quantity: 12, brand:'SamCafaso',total:1000},
    {price: 12.0, name: 'ABC', quantity: 12, brand:'SamCafaso',total:1000},
    {price: 127.72, name: 'DFE', quantity: 12, brand:'SamCafaso',total:1000},
  ],
})

// That's it! Do whatever you want now.
// Pipe it to a file for instance:

const fs = require('fs')

document.generate() // triggers rendering
// console.log(document.pdfKitDoc);
document.pdfkitDoc.pipe(fs.createWriteStream(__dirname+'/my-invoice.pdf'))

// const Invoice = require("nodeice");
//
// // Create the new invoice
// let myInvoice = new Invoice({
//     config: {
//         template: __dirname + "/template/index.html"
//       , tableRowBlock: __dirname + "/template/blocks/row.html"
//     }
//   , data: {
//         currencyBalance: {
//             main: 1
//           , secondary: 3.67
//         }
//       , invoice: {
//             number: {
//                 series: "PREFIX"
//               , separator: "-"
//               , id: 1
//             }
//           , date: "01/02/2014"
//           , dueDate: "11/02/2014"
//           , explanation: "Thank you for your business!"
//           , currency: {
//                 main: "XXX"
//               , secondary: "ZZZ"
//             }
//         }
//       , tasks: [
//             {
//                 description: "Some interesting task"
//               , unit: "Hours"
//               , quantity: 5
//               , unitPrice: 2
//             }
//           , {
//                 description: "Another interesting task"
//               , unit: "Hours"
//               , quantity: 10
//               , unitPrice: 3
//             }
//           , {
//                 description: "The most interesting one"
//               , unit: "Hours"
//               , quantity: 3
//               , unitPrice: 5
//             }
//         ]
//     }
//   , seller: {
//         company: "My Company Inc."
//       , registrationNumber: "F05/XX/YYYY"
//       , taxId: "00000000"
//       , address: {
//             street: "The Street Name"
//           , number: "00"
//           , zip: "000000"
//           , city: "Some City"
//           , region: "Some Region"
//           , country: "Nowhere"
//         }
//       , phone: "+40 726 xxx xxx"
//       , email: "me@example.com"
//       , website: "example.com"
//       , bank: {
//             name: "Some Bank Name"
//           , swift: "XXXXXX"
//           , currency: "XXX"
//           , iban: "..."
//         }
//     }
//   , buyer: {
//         company: "Another Company GmbH"
//       , taxId: "00000000"
//       , address: {
//             street: "The Street Name"
//           , number: "00"
//           , zip: "000000"
//           , city: "Some City"
//           , region: "Some Region"
//           , country: "Nowhere"
//         }
//       , phone: "+40 726 xxx xxx"
//       , email: "me@example.com"
//       , website: "example.com"
//       , bank: {
//             name: "Some Bank Name"
//           , swift: "XXXXXX"
//           , currency: "XXX"
//           , iban: "..."
//         }
//     }
// });
//
// // Render invoice as HTML and PDF
// myInvoice.toHtml(__dirname + "/my-invoice.html", (err, data) => {
//     console.log("Saved HTML file");
// }).toPdf(__dirname + "/my-invoice.pdf", (err, data) => {
//     console.log("Saved pdf file");
// });
//
// // Serve the pdf via streams (no files)
// // require("http").createServer((req, res) => {
// //     myInvoice.toPdf({ output: res });
// // }).listen(8000);
