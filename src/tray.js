const {Menu, MenuItem, Tray} = require('electron')
const {Worker} = require('./worker')
const {launchConfigEditor} = require('./config')
const {AutoStart} = require('./autostart')
const {Logger} = require('./logger')

function initTray() {
  tray = new Tray('./resources/icon.png')
  let autoStart = new AutoStart()
  let logger = new Logger()
  let worker = new Worker(logger)
  let contextMenu = new Menu()

  contextMenu.append(
    new MenuItem({
      label: 'Restart V2Ray',
      click () { worker.restart() }
    })
  )

  let menuForAutoStart = new MenuItem({
    label: "Start on Boot",
    type: "checkbox",
    click: () => {
        autoStart.toggle().then(() => {isEnabled => menuForAutoStart.checked = isEnabled})
    }
  })
  contextMenu.append(menuForAutoStart)
  autoStart.isEnabled().then(isEnabled => menuForAutoStart.checked = isEnabled)

  contextMenu.append(
    new MenuItem({
      label: 'Edit Config',
      click () { launchConfigEditor() }
    })
  )

  contextMenu.append(
    new MenuItem({
      label: 'Show log',
      click () { logger.showWindow() }
    })
  )

  contextMenu.append(
    new MenuItem({
      role: 'quit'
    })
  )
  
  tray.setToolTip('V2Ray')
  tray.setContextMenu(contextMenu)
  
  worker.start()
}

exports.initTray = initTray