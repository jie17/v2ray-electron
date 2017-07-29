const { execFile } = require('child_process')
const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const {app, ipcMain} = require('electron')

class Worker {
  constructor(logger) {
    this.status = 'stopped';
    if (os.platform() === "darwin")
      this.executablePath = path.join(global.ROOT, 'assets', 'v2ray', 'v2ray')
    else
      this.executablePath = path.join(global.ROOT, 'assets', 'v2ray', 'v2ray.exe')
    this.child = null
    this.logger = logger
    this.userDataPath = app.getPath('userData')
    this.configPath = path.join(this.userDataPath, "v2ray.json")
    this.initConfig()
    ipcMain.on("restart", event => {
      this.restart()
    })
  }

  start() {
    this.child = execFile(this.executablePath, ["-config", this.configPath])
    this.child.stdout.on('data', data => {
      this.logger.append(data)
      })
    this.child.stderr.on('data', data => {
      this.logger.append(data)
    })
  }

  restart() {
    this.child.kill()
    this.start()
  }

  stop() {
    this.child.kill()
  }

  initConfig() {
    if(!fs.existsSync(this.configPath)) {
      let defaultConfigPath = path.join(global.ROOT, 'assets', 'v2ray', 'config.json.default')
      fs.copySync(defaultConfigPath, this.configPath)
    }
  }
}

exports.Worker = Worker