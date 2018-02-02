const { spawn, exec } = require('child_process')
const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const {app, ipcMain} = require('electron')
const log = require('electron-log');

class Worker {
  constructor(logger) {
    this.status = 'stopped';
    let executableName = os.platform() === "darwin" ? 'v2ray' : 'v2ray.exe'
    if (global.ROOT.indexOf('app.asar') > 0) {
      this.executableDirectory = path.join(global.ROOT, 'assets', 'v2ray', 'v2ray').replace('app.asar', 'app.asar.unpacked')
    } else {
      this.executableDirectory = path.join(global.ROOT, 'assets', 'v2ray', `v2ray-${os.platform() === "darwin" ? 'macos' : 'win'}`).replace('app.asar', 'app.asar.unpacked')
    }
    this.executablePath = path.join(this.executableDirectory, executableName)
    if (os.platform() === 'darwin') {
      exec(`chmod +x "${this.executablePath}"`)
      exec(`chmod +x "${path.join(this.executableDirectory, 'v2ctl')}"`)
    }
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
    log.info("Starting worker ", this.executablePath)
    log.info("With config", this.configPath)
    this.child = spawn(this.executablePath, ["-config", this.configPath])
    this.child.stdout.on('data', data => {
      this.logger.append(data)
      })
    this.child.stderr.on('data', data => {
      this.logger.append(data)
    })
  }

  restart() {
    log.info("Restarting worker ", this.executablePath)
    this.child.kill()
    this.start()
  }

  stop() {
    this.child.kill()
  }

  initConfig() {
    if(!fs.existsSync(this.configPath)) {
      log.info("Config file not exists. Copying from default config file.")
      let defaultConfigPath = path.join(global.ROOT, 'assets', 'v2ray', 'v2ray', 'config.json.default')
      fs.copySync(defaultConfigPath, this.configPath)
    }
  }
}

exports.Worker = Worker