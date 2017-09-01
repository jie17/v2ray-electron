const {BrowserWindow} = require('electron')

class PacEditor {
  constructor() {
    this.win = null
  }

  launch() {
    if(!this.win) {
      this.win = new BrowserWindow({
        width: 800, 
        height: 600,
        title: "Pac Editor"
      })
      this.win.on('closed', () => {
        this.win = null
      })

      this.win.setMenu(null)
      this.win.loadURL(`file://${__dirname}/pages/pac-editor/index.html`)
    }
    else {
      this.win.focus()
    }
  }
}

exports.PacEditor = PacEditor