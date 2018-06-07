const {app, BrowserWindow, ipcMain} = require('electron');
const glob = require('glob');
const path = require('path');
const isDev = require('electron-is-dev');
const debug = /--debug/.test(process.argv[2]); // run `npm run debug`
const db = require('./db.js');
const moment = require('moment');
const {autoUpdater} =  require('electron-updater');
const log = require('electron-log');


//-------------------------------------------------------------------
// Logging
//
//
// makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');





let mainWindow = null;

function initialize() {
  const shouldQuit = makeSingleInstance();
  if(shouldQuit) app.quit();

  loadMainProcess();

  function createWindow(){
    const windowOptions = {
      width:1080,
      height:840,
      minWidth: 680,
      title:app.getName()
    };

    if (process.platform === 'linux') {
      windowOptions.icon = path.join(__dirname, '/icon.png');
    }

    const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;

    mainWindow = new BrowserWindow(windowOptions);
    mainWindow.loadURL(startUrl);

    if(debug) {
      mainWindow.webContents.openDevTools();
      mainWindow.maximize();
      require('devtron').install();
    }

    // when user clicked on closed on window
    mainWindow.on('closed', () => {
      mainWindow = null; // so it can be garbage collected
    });
  }


  app.on('ready', () => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify()
    db.sequelize
      .authenticate()
      .then(() => {
        log.info('Connection has been established successfully');
        return db.sequelize.sync({});
      })
      .then(() => {
        log.info('db is already in sync');
        return db.sequelize.transaction(function(t) {
          let timestamps = moment().valueOf();
          return db.customer.findOrCreate({
            where: { name:'Other' }, defaults:{name:'Other'},transaction:t}).then(() => {
            let actions = ['sell','return','new','restock','delete','update'];
            let promises = [];
            actions.forEach((action) => {
              promises.push(db.action.findOrCreate({ where: {action: action},transaction:t}));
            });
            return Promise.all(promises);
          }).catch(e => {
            log.info('something is wrong with transaction', e);
            throw e;
          });
        })
      }).then((res) => {
        log.info(`finished initializing`);
      })
      .catch(e => {
        log.info('Unable to connect/initialized to the database', e);
        throw e;
      });
  });

  /// for Mac
  app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
      app.quit();
    }
  });

  /// for Mac when open the application will launch a browserWindow again
  app.on('activate', () => {
    if(mainWindow === null) {
      createWindow();
    }
  });

}


// Making this a single Instance app
// That means when open a new application, you cannot open another new
// application again. It is only 1 instance
function makeSingleInstance() {
  if(process.mas) return false;

  return app.makeSingleInstance(() => {
    if(mainWindow) {
      if(mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus();
    }
  });
}

// Import all the IPC sender from Main Process
function loadMainProcess() {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'));
  files.forEach((file) => require(file));
}


initialize();
