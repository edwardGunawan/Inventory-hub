const {ipcMain} = require('electron');

ipcMain.on('auth', (event,data) => {
  console.log('data passed from login component', data);
  event.sender.send('reply-auth', 'isLogin')

});
