const {BrowserWindow} = require('electron')

class ConfigEditor {
  constructor() {
    this.win = null
  }

  launch() {
    if(!this.win) {
      this.win = new BrowserWindow({
        width: 800, 
        height: 600,
        title: "Configuration Editor - V2Ray Electron"
      })
      this.win.on('closed', () => {
        this.win = null
      })

      this.win.setMenu(null)
      this.win.loadURL(`file://${__dirname}/pages/config-editor/index.html`)
    }
    else {
      this.win.focus()
    }
  }
}

exports.ConfigEditor = ConfigEditor