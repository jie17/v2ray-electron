const {
  execFile
} = require('child_process')
const {
  app,
  MenuItem
} = require('electron')
const path = require('path')
const http = require('http')
const fs = require('fs')
const Store = require('electron-store');
const store = new Store();

class SystemProxy {
  constructor() {
    this.enabled = false
    this.pac_server = null
    this.userDataPath = app.getPath('userData')
    this.pacPath = path.join(this.userDataPath, "proxy.pac")
    this.proxyConfHelperPath = path.join(global.ROOT, 'assets', 'proxy_conf_helper').replace('app.asar', 'app.asar.unpacked')
    this.initializeMenuItems()
    this.mode = store.get('proxy-mode')
    if (this.mode) {
      this.applyModePacServer(this.mode)
      this.setMode(this.mode)
    }
    else {
      this.setMode('standalone')
    }
  }

  initializeMenuItems() {
    let me = this
    me.menuItems = new Object()
    me.menuItems.standalone = new MenuItem({
      label: 'Standalone Mode',
      type: "checkbox",
      click(menuItem, browserWindow, event) {
        me.applyMode('standalone')
      }
    })
    me.menuItems.pac = new MenuItem({
      label: 'Pac Mode',
      type: "checkbox",
      click(menuItem, browserWindow, event) {
        me.applyMode('pac')
      }
    })
    me.menuItems.global = new MenuItem({
      label: 'Global Mode',
      type: "checkbox",
      click(menuItem, browserWindow, event) {
        me.applyMode('global')
      }
    })
  }

  applyMode(mode) {
    let me = this
    if (mode !== this.mode) {
      switch (mode) {
        case 'standalone':
          execFile(me.proxyConfHelperPath, ["-m", "off"])
          break
        case 'pac':
          execFile(me.proxyConfHelperPath, ["-m", "auto", "-u", "http://localhost:22222/proxy.pac"])
          break
        case 'global':
          execFile(me.proxyConfHelperPath, ["-m", "global", "-p", "1080"])
          break
      }
      me.applyModePacServer(mode)
      me.setMode(mode)
    }
  }

  applyModePacServer(mode) {
    if (mode === 'pac') {
      this.turnOnPacServer()
    }
    else {
      this.turnOffPacServer()
    }
  }

  setMode(mode) {
    this.mode = mode
    Object.values(this.menuItems).forEach(menuItem => menuItem.checked = false)
    this.menuItems[this.mode].checked = true
    store.set('proxy-mode', mode)
  }

  turnOffSystemProxyIfEnabled() {
    if (this.mode !== 'standalone')
      execFile(this.proxyConfHelperPath, ["-m", "off"])
  }

  turnOffPacServer() {
    if (this.pac_server) {
      this.pac_server.close()
      this.pac_server = null
    }
  }

  turnOnPacServer() {
    let pacPath = this.pacPath
    this.pac_server = http.createServer(function (req, res) {
      fs.readFile(pacPath, function (err, file) {
        if (err) {
          res.writeHead(500, {
            "Content-Type": "text/plain"
          })
          res.write(err + "\n")
          res.end()
          return
        }

        res.writeHead(200)
        res.write(file)
        res.end()
      })
    }).listen(22222, '127.0.0.1')
  }
}

exports.SystemProxy = SystemProxy