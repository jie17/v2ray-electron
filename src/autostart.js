// const Registry = require('winreg')
const AutoLaunch = require('auto-launch');

// class AutoStart {
//   constructor() {
//     this.regKey = new Registry({                                       // new operator is optional
//       hive: Registry.HKCU,                                        // open registry hive HKEY_CURRENT_USER
//       key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' // key containing autostart programs
//     })
//     this.name = "V2Ray_Electron"
//   }

//   enable() {
//     this.regKey.set(this.name, Registry.REG_SZ, value, function(err) {

//     })
//   }

//   disable() {
//     this.regKey.remove(this.name, function(err) {

//     })
//   }

//   enabled() {
//     this.regKey.valueExists(this.name, function(err, exists) {
//       return exists
//     })
//   }
// }

class AutoStart {
  constructor() {
    this.autoLauncher = new AutoLaunch({
      name: 'V2Ray Electron'
    });
  }

  isEnabled() {
    return this.autoLauncher.isEnabled();
  }

  toggle() {
    return this.isEnabled()
    .then(isEnabled => {
      if(isEnabled) {
        this.autoLauncher.disable()
      }
      else {
        this.autoLauncher.enable()
      }
      return isEnabled
    })
  }
}

exports.AutoStart = AutoStart