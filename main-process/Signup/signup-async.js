const {ipcMain, dialog, BrowserWindow} = require('electron');
const db = require('../../db.js');

ipcMain.on('signup', (event,data) => {
  console.log('data is received', data);
  db.user.create(data)
  .then((user) => {
    console.log('user is created', user);
    event.sender.send('reply-signup', {status:'Created'});
  })
  .catch(e => {
    event.sender.send('reply-signup',{status:e});
  });
})
