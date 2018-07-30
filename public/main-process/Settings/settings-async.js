const {ipcMain} = require('electron');
const db = require('../../db.js');
const env = require('../../config/env')
const nodemailer = require('nodemailer')
const log = require('electron-log')

ipcMain.on('change-password',async (evt,data) => {
  const t = await db.sequelize.transaction();
  try {
    let {oldPassword,newPassword,email} = data;
    let user = await db.user.findOne({where:{email}},{transaction:t});
     // from the instance itself
    if(user.check(oldPassword)){
      const updated = await user.update({admin_password:newPassword},{transaction:t});
      await t.commit();
      evt.sender.send('reply-change-password',{status:'OK',message:'successful'});
    }
  } catch (e) {
    await t.rollback();
    log.error('something is wrong on changing password', e)
    evt.sender.send('reply-change-password',{status:'Error',message:e});
    throw e;
  }
})


ipcMain.on('email-notification', async (evt,data) => {
  const t = await db.sequelize.transaction();
  try {
    let {email} = data;
    const user = await db.user.findOne({where:{email}},{transaction:t});
    let password = user.getPassword();
    let transporter = nodemailer.createTransport(env.transporter);
    const mailOption = {
      from: env.transporter.auth.user,
      to:email,
      subject: 'Your Password for Inventory Username',
      text: `Hello,

      Your password for admin username is : ${password}

    Thanks,
    Inventory-hub Team
      `
    }
    const info = await transporter.sendMail(mailOption);
    log.info('info for transporter', info)
    await t.commit();
    evt.sender.send('reply-email-notification', {status:'OK', message:'Message has been Sent!'})
  } catch(e) {
    log.error('something is wrong on emailing password', e)
    await t.rollback();
    evt.sender.send('reply-email-notification', {status:'Error',message:e});
    throw e;
  }
});
