const { execFile } = require('child_process');

class Worker {
  constructor() {
    this.status = 'stopped';
    this.executablePath = "v2ray/v2ray.exe";
    this.child = null;
  }

  start() {
    this.child = execFile(this.executablePath, (error, stdout, stderr) => {
      // if (error) {
      //   throw error;
      // }
      console.log(stdout);
    });
  }

  restart() {
    this.child.kill();
    this.start();
  }
}

exports.Worker = Worker;