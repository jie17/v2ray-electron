const { execFile } = require('child_process')
const os = require('os')

class Worker {
  constructor(logger) {
    this.status = 'stopped';
    if (os.platform() === "darwin")
      this.executablePath = "resources/v2ray/v2ray";
    else
      this.executablePath = "resources/v2ray/v2ray.exe";
    this.child = null;
    this.logger = logger;
  }

  start() {
    this.child = execFile(this.executablePath, (error, stdout, stderr) => {
      // if (error) {
      //   throw error;
      // }
      // console.log(stdout);
    });
    this.child.stdout.on('data', data => {
      this.logger.append(data)
      });
    this.child.stderr.on('data', data => {
      this.logger.append(data)
    });
  }

  restart() {
    this.child.kill();
    this.start();
  }

  stop() {
    this.child.kill();
  }
}

exports.Worker = Worker;