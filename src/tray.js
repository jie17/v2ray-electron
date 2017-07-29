const {Menu, MenuItem, Tray, process} = require('electron')
const {Worker} = require('./worker')
const {ConfigEditor} = require('./config')
const {AutoStart} = require('./autostart')
const {Logger} = require('./logger')
const {SystemProxy} = require('./proxy_conf_helper')
const os = require('os')
const path = require('path')

function initTray(worker, logger, systemProxy) {
  tray = new Tray(path.join(global.ROOT, 'assets', `icon-${os.platform()}.png`))
  let autoStart = new AutoStart()
  let contextMenu = new Menu()
  let configEditor = new ConfigEditor()

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
      click () { configEditor.launch() }
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
      role: 'about'
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