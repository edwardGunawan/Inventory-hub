const {ipcMain} = require('electron');
const db = require('../../db.js');

ipcMain.on('change-password',async (evt,data) => {
  const t = await db.sequelize.transaction();
  try {
    let {oldPassword,newPassword,email} = data;
    let user = await db.user.findOne({where:{email}},{transaction:t});

    if(user.check(oldPassword)){
      const updated = await user.update({admin_password:newPassword},{transaction:t});
      await t.commit();
      evt.sender.send('reply-change-password',{status:'OK',message:'successful'});
    }
  } catch (e) {
    await t.rollback();
    evt.sender.send('reply-change-password',{status:'Error',message:e});
    throw e;
  }
})
