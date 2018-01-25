const {Menu, MenuItem, Tray, process, app} = require('electron')
const {Worker} = require('./worker')
const {ConfigEditor} = require('./config-editor')
const {PacEditor} = require('./pac-editor')
const {AutoStart} = require('./autostart')
const {Logger} = require('./logger')
const {SystemProxy} = require('./proxy_conf_helper')
const os = require('os')
const path = require('path')
const openAboutWindow = require('about-window').default;

function initTray(worker, logger, systemProxy) {
  tray = new Tray(path.join(global.ROOT, 'assets', `icon-${os.platform()}.png`))
  let autoStart = new AutoStart()
  let contextMenu = new Menu()
  let configEditor = new ConfigEditor()
  let pacEditor = new PacEditor()

  if (systemProxy) {
    for (let key in systemProxy.menuItems) {
      contextMenu.append(systemProxy.menuItems[key])
    }

    contextMenu.append(
      new MenuItem({
        type: 'separator'
      })
    )
  }

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
      label: 'Edit V2Ray Config',
      click () { configEditor.launch() }
    })
  )

  if (os.platform() === "darwin") {
    contextMenu.append(
      new MenuItem({
        label: 'Edit PAC File',
        click () { pacEditor.launch() }
      })
    )
  }

  contextMenu.append(
    new MenuItem({
      label: 'Show V2Ray Log',
      click () { logger.showWindow() }
    })
  )

  contextMenu.append(
    new MenuItem({
      label: `About ${app.getName()}`,
      click(item, focusedWindow) {
          openAboutWindow({
              icon_path: path.join(__dirname, '..', 'assets', 'icon-win32.png')
          });
      }
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