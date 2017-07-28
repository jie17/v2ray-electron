const path = require('path')
const url = require('url')

// require('electron-debug')({showDevTools: true})

const {app, Menu, MenuItem, Tray} = require('electron')
const {Worker} = require('./worker')
const {launchConfigEditor} = require('./config')
const {AutoStart} = require('./autostart')

let tray = null
app.on('ready', () => {
  tray = new Tray('./resources/icon.png')
  let worker = new Worker()
  let autoStart = new AutoStart()
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
  let menuForAutoStart = new MenuItem({
    label: "Start on Boot",
    type: "checkbox",
    click: () => {
        autoStart.toggle().then(() => {isEnabled => menuForAutoStart.checked = isEnabled})
    }
  })
  contextMenu.append(menuForAutoStart)
  autoStart.isEnabled().then(isEnabled => menuForAutoStart.checked = isEnabled)
  
  tray.setToolTip('V2Ray')
  tray.setContextMenu(contextMenu)
  
  worker.start()
})

app.on('window-all-closed', () => {

})