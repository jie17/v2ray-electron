import AutoLaunch from "auto-launch";
import { app } from "electron";

class AutoStart {
  autoLauncher: AutoLaunch;
  constructor() {
    this.autoLauncher = new AutoLaunch({
      mac: {
        useLaunchAgent: true
      },
      name: app.getName()
    });
  }

  isEnabled() {
    return this.autoLauncher.isEnabled();
  }

  toggle() {
    return this.isEnabled().then(isEnabled => {
      if (isEnabled) {
        this.autoLauncher.disable();
      } else {
        this.autoLauncher.enable();
      }
      return isEnabled;
    });
  }
}

export { AutoStart };
