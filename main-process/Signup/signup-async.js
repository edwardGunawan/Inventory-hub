const {ipcMain, dialog, BrowserWindow} = require('electron');
const db = require('../../db.js');
const bcrypt = require('bcryptjs');

/**
  return the email of the users
  */
ipcMain.on('get-email',async (evt,data) => {
  const t = await db.sequelize.transaction();
  try {
    const users = await db.user.findAll({transaction:t});
    const message = (users.length >0) ? users[0].get('email') : 'first';
    await t.commit();
    evt.sender.send('reply-get-email',{status:'OK',message});
  } catch(e) {
    console.log(e);
    await t.rollback();
    evt.sender.send('reply-get-email',{status:'Error',message:e});
    throw e;
  }
})

/**
  data: {
    email,
    admin_password:
  }
  // return the email of the user
*/

ipcMain.on('signup', async (event,data) => {
  const t = await db.sequelize.transaction();
  try {
    console.log('data is received, currently creating in DB ....');
    const user = await db.user.create(data,{transaction:t});
    await t.commit();
    event.sender.send('reply-signup',{status:'OK',message:user.get('email')});
  } catch(e) {
    console.log(e);
    await t.rollback();
    event.sender.send('reply-signup',{status:'Error',message:e});
    throw e;
  }
})
