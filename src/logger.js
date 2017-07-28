const {BrowserWindow} = require('electron')

class Logger {
  constructor() {
    this.string = ""
    this.windowOpen = false;
    this.win = null;
  }

  append(data) {
    this.string += data
    if(this.windowOpen) {
      this.win.webContents.send('log', data)
    }
  }

  showWindow() {
    this.win = new BrowserWindow({
      width: 800, 
      height: 600,
      title: "Log Viewer - V2Ray Electron"
    })
    this.win.on('closed', () => {
      this.win = null
      this.windowOpen = false
    })

    this.win.setMenu(null)
    this.win.loadURL(`file://${__dirname}/pages/logger/index.html`)
    this.win.webContents.on('did-finish-load', () => {
      this.win.webContents.send('log', this.string)
    })
    this.windowOpen = true;
  }
}

exports.Logger = Logger