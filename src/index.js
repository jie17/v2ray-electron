const path = require('path')

global.ROOT = path.join(__dirname, '..')

const {app} = require('electron')
const {initTray} = require('./tray')
const {SystemProxy} = require('./proxy_conf_helper')
const {Worker} = require('./worker')
const {Logger} = require('./logger')

require('electron-debug')({showDevTools: true})

let tray = null
let systemProxy = new SystemProxy()
let logger = new Logger()
let worker = new Worker(logger)

app.on('ready', () => {
  app.dock.hide()
  initTray(worker, logger, systemProxy)
})

app.on('window-all-closed', () => {

})

app.on('quit', () => {
  systemProxy.turnOffSystemProxyIfEnabled()
  worker.stop()
})