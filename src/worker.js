const { execFile } = require('child_process');

class Worker {
  constructor() {
    this.status = 'stopped';
    this.executablePath = "v2ray/wv2ray.exe";
  }

  start() {
    const child = execFile(this.executablePath, (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      console.log(stdout);
    });
  }
}

exports.Worker = Worker;