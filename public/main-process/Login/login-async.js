const {ipcMain} = require('electron');
const db = require('../../db.js');

ipcMain.on('login-auth', (event,data) => {
  console.log('data passed from login component', data);
  // authentication is to generate hashvalue in bcrypt and check if the password exist
  // however when the user close and get back in, they need to sign in again
  // do authentication here
  db.user.authenticate(data).then((user) => {
    console.log('user here in login-async after authenticating',data);
    // pass just let the user login
    event.sender.send('reply-login-auth', {
                                      status:'OK',
                                      message: {
                                        email: user.get('email')
                                      }
                                    });
  })
  .catch((e) => {
    console.log(' error happen with authentication', e);
    event.sender.send('reply-login-auth',{status:'failed',message:e})
  });
});
