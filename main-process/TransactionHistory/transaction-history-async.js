// const {ipcMain, app} = require('electron');
const db = require('../../db.js');
const convertExcel = require('../Helper/convertExcel.js');
let convert = convertExcel({database:db});




convert.init()
.then(()=> convert.getTransaction(05,2018))
.then(
  (objArr) => convert.writeToSheet(['based Date','based Customer','based Product'],objArr,'date','customer','product'))
.then(() => console.log('finish executing'))
.catch(e => console.error(e) );
