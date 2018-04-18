let {ipcMain} = require('electron');

let db = require('../../db.js');

/*
  Create new product
*/
// One product
ipcMain.on('create', (e,data) => {

});



// Import from Excel
ipcMain.on('bulk-import',(e,data) => {

});
