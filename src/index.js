const path = require('path')
const url = require('url')

require('electron-debug')({showDevTools: true})

const {app} = require('electron')
const {initTray} = require('./tray')

let tray = null
app.on('ready', () => {
  initTray()
})

app.on('window-all-closed', () => {

})