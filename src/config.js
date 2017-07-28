const {BrowserWindow} = require('electron')

function launchConfigEditor() {
  let win = new BrowserWindow({width: 800, height: 600})
  win.on('closed', () => {
    win = null
  })

  win.setMenu(null)
  win.loadURL(`file://${__dirname}/pages/config-editor/index.html`)
}

exports.launchConfigEditor = launchConfigEditor