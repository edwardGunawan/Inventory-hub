let {ipcMain} = require('electron');
let db = require('../../db.js');
let XLSX = require('xlsx');

/*
  Create new product
*/
// One product
ipcMain.on('create', (e,data) => {
  db.product.create(data)
    .then((product) => {
      e.sender.send('reply-create', {
        status:'OK',
        message: `${product.get('code')}`
     });
    })
    .catch(error => {
      e.sender.send('reply-create', {status:'Error', message: error});
    });
});



// Import from Excel
// data will contain path for excel spreadsheet
ipcMain.on('bulk-import',async (e,data) => {
  try {
    let {path} = data;
    let excelObj = await importExcel(path);
    let products = await db.product.bulkCreate(excelObj);
    e.sender.send('reply-bulk-import', {status:'OK', message:'Import From Excel Succeed'});
  }catch(e) {
    e.sender.send('reply-bulk-import', {status:'Error', message: e});
  }
});


async function importExcel(path) {
  let workbook = XLSX.readFile(path);

  let ws = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);

  // get rid of frist 3 because that is the description
  ws.splice(0,3);

  // bulk Import needs to add id by itself, it can't generate ID
  return ws.map((item) => {
    let {__EMPTY_1} = item; // amount
    let count = 0;
    return {
      id: count++,
      code: item['Posisi Stok'],
      amount: Number(__EMPTY_1.replace(/,/g,'')), // get rid of commas for integer value
      price: 100 // current still fixed, excel should write price number
    }
  });
}
