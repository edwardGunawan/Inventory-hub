const {ipcMain} = require('electron');

ipcMain.on('login-auth', (event,data) => {
  console.log('data passed from login component', data);
  // do authentication here
  event.sender.send('reply-auth', {status:'isLogin'});
});
