const { execFile } = require('child_process')
const path = require('path')

let executable = path.join(global.ROOT, 'assets', 'proxy_conf_helper')

class SystemProxy {
  constructor() {
    this.enabled = false;
  }

  setSystemProxy() {
    execFile(executable, ["-m", "global", "-p", "1080"])
  }

  turnOffSystemProxy() {
    execFile(executable, ["-m", "off"])
  }

  turnOffSystemProxyIfEnabled() {
    if(this.enabled)
      execFile(executable, ["-m", "off"])
  }

  toggle() {
    if(this.enabled)
      turnOffSystemProxy()
    else
      setSystemProxy()
  }
}



exports.SystemProxy = SystemProxy;