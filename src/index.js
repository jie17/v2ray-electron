const path = require('path')
const url = require('url')

// require('electron-debug')({showDevTools: true})

const {app, Menu, Tray} = require('electron')
const {Worker} = require('./worker')

let tray = null
app.on('ready', () => {
  tray = new Tray('./v2ray.png')
  const contextMenu = Menu.buildFromTemplate([
    {role: 'quit'}
  ])
  tray.setToolTip('V2Ray')
  tray.setContextMenu(contextMenu)
  let worker = new Worker()
  worker.start()
})