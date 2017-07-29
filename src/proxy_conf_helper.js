const { execFile } = require('child_process');

let executable = "resources/proxy_conf_helper"

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