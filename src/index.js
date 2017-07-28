const path = require('path')
const url = require('url')

// require('electron-debug')({showDevTools: true})

const {app, Menu, Tray} = require('electron')
const {Worker} = require('./worker')
const {launchConfigEditor} = require('./config')

let tray = null
app.on('ready', () => {
  tray = new Tray('./resources/icon.png')
  let worker = new Worker()
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Restart V2Ray',
      click () { worker.restart() }
    },
    {
      label: 'Edit Config',
      click () { launchConfigEditor() }
    },
    {role: 'quit'}
  ])
  tray.setToolTip('V2Ray')
  tray.setContextMenu(contextMenu)
  
  worker.start()
})

app.on('window-all-closed', () => {

})