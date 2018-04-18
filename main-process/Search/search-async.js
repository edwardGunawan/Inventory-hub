let {ipcMain} = require('electron');
let db = require('../../db.js');

ipcMain.on('search', (event, data) => {
  // do full-text search here
});
