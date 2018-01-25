
const path = require('path');

global.ROOT = path.join(__dirname, '..')

const {app, Menu} = require('electron')
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
let systemProxy = os.platform() === "darwin" ? new SystemProxy() : null
let logger = new Logger()
let worker = new Worker(logger)

app.on('ready', () => {
  log.info("App ready")

  const template = [
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'pasteandmatchstyle'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  if (!process.env.NODE_ENV === 'development') {
    autoUpdater.checkForUpdates();
  }
  if (os.platform() === 'darwin')
    app.dock.hide()
  initTray(worker, logger, systemProxy)
})

app.on('window-all-closed', () => {

})

app.on('quit', () => {
  worker.stop()
  if (systemProxy) {
    systemProxy.turnOffSystemProxyIfEnabled()
  }
  log.info("App quit")
})

autoUpdater.on('update-not-available', (info) => {
  setTimeout(() => autoUpdater.checkForUpdates(), 3600000);
})

autoUpdater.on('error', (err) => {
  setTimeout(() => autoUpdater.checkForUpdates(), 3600000);
})