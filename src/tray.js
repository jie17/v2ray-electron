const {Menu, MenuItem, Tray} = require('electron')
const {Worker} = require('./worker')
const {launchConfigEditor} = require('./config')
const {AutoStart} = require('./autostart')
const {Logger} = require('./logger')
const {SystemProxy} = require('./proxy_conf_helper')
const os = require('os')

function initTray(worker, logger, systemProxy) {
  tray = new Tray(`./resources/icon-${os.platform()}.png`)
  let autoStart = new AutoStart()
  let contextMenu = new Menu()

  contextMenu.append(
    new MenuItem({
      label: 'Restart V2Ray',
      click () { worker.restart() }
    })
  )

  if (os.platform() === "darwin") {
    contextMenu.append(
      new MenuItem({
        label: 'System proxy',
        type: "checkbox",
        click () {
          systemProxy.toggle()
          this.checked = !this.checked
        }
      })
    )
  }

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