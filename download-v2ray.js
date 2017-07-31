let version = "v2.33";

const https = require('https');
const fs = require('fs');
const os = require('os');
const request = require('request');
const AdmZip = require('adm-zip');

let url = null;
let destination_dir = null;
let filename = null;
let executable_name = null;

if (os.platform() === "win32") {
  if (os.arch() === "x64") {
    url = `https://github.com/v2ray/v2ray-core/releases/download/${version}/v2ray-windows-64.zip`;
    filename = `v2ray-${version}-windows-64.zip`;
    destination_dir = `v2ray-${version}-windows-64`;
    executable_name = "v2ray.exe";
  }
}
if (os.platform() === "darwin") {
  url = `https://github.com/v2ray/v2ray-core/releases/download/${version}/v2ray-macos.zip`;
  filename = `v2ray-${version}-macos.zip`;
  destination_dir = `v2ray-${version}-macos`;
  executable_name = "v2ray";
}

switchIntoWorkSpace();
cleanUpOldFiles();
if(!alreadyExists()) {
  download();
}
else {
  unzipAndMove();
}

function switchIntoWorkSpace() {
  // Create v2ray if not exists and enter the folder
  let dir = './assets/v2ray';
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }
  process.chdir(dir);
}

function cleanUpOldFiles() {
  [executable_name, "config.json.default"].forEach(filename => removeIfExists(filename));
  removeIfExists(destination_dir);
}

function alreadyExists() {
  return fs.existsSync(filename);
}

function removeIfExists(path) {
  if(fs.existsSync(path)) {
    if(fs.lstatSync(path).isDirectory()) {
      fs.rmdirSync(path);
    }
    else {
      fs.unlinkSync(path);
    }
    
  }
}

function download() {
  console.log("Downloading ", url);
  if (url !== null) {
    request(url).pipe(fs.createWriteStream(filename)).on('finish', () => { unzipAndMove()})
  }
}

function unzipAndMove() {
    let zip = new AdmZip(filename);
    zip.extractEntryTo(`${destination_dir}/${executable_name}`, "./");
    zip.extractEntryTo(`${destination_dir}/config.json`, "./");
    fs.renameSync(`${destination_dir}/${executable_name}`, `./${executable_name}`);
    fs.renameSync(`${destination_dir}/config.json`, "./config.json.default");
    fs.rmdirSync(destination_dir);
}