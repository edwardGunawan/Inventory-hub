const {ipcMain} = require('electron');
const db = require('../../db.js');

ipcMain.on('login-auth', (event,data) => {
  console.log('data passed from login component', data);
  // authentication is to generate hashvalue in bcrypt and check if the password exist
  // however when the user close and get back in, they need to sign in again
  // do authentication here
  event.sender.send('reply-auth', {status:'isLogin'});
});
