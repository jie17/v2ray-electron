
const path = require('path');

global.ROOT = path.join(__dirname, '..')

const {app} = require('electron')
const {initTray} = require('./tray')
const {SystemProxy} = require('./proxy_conf_helper')
const {Worker} = require('./worker')
const {Logger} = require('./logger')
const os = require('os')
const log = require('electron-log')
const autoUpdater = require("electron-updater").autoUpdater

require('electron-debug')({showDevTools: true})
log.transports.file.level = 'debug';

let tray = null
let systemProxy = new SystemProxy()
let logger = new Logger()
let worker = new Worker(logger)

app.on('ready', () => {
  log.info("App ready")
  autoUpdater.checkForUpdates();
  if (os.platform() === 'darwin')
    app.dock.hide()
  initTray(worker, logger, systemProxy)
})

app.on('window-all-closed', () => {

})

app.on('quit', () => {
  worker.stop()
  log.info("App quit")
})

autoUpdater.on('update-not-available', (info) => {
  setTimeout(() => autoUpdater.checkForUpdates(), 3600000);
})

autoUpdater.on('error', (err) => {
  setTimeout(() => autoUpdater.checkForUpdates(), 3600000);
})