const {BrowserWindow} = require('electron')

let win = null;

function launchConfigEditor() {
  if(!win) {
    let win = new BrowserWindow({
      width: 800, 
      height: 600,
      title: "Configuration Editor - V2Ray Electron"
    })
    win.on('closed', () => {
      win = null
    })

    win.setMenu(null)
    win.loadURL(`file://${__dirname}/pages/config-editor/index.html`)
  }
  else {
    win.focus()
  }
}

exports.launchConfigEditor = launchConfigEditor