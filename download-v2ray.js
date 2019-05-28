const version = "v4.18.0";

const https = require('https');
const fs = require('fs-extra');
const os = require('os');
const request = require('request');
const unzipper = require('unzipper');

switchIntoWorkSpace();

if (runningOnTravis()) {
  ["win32", "darwin"].forEach(platform => runTaskOnPlatform(platform));
}
else {
  runTaskOnPlatform(os.platform());
}

function runTaskOnPlatform(platform) {
  let params = setPlatform(platform);
  cleanUpOldFiles(params);
  if (!alreadyExists(params)) {
    download(params);
  } else {
    unzipAndMove(params);
  }
}

function setPlatform(platform) {
  if (platform === "win32") {
    let url = `https://github.com/v2ray/v2ray-core/releases/download/${version}/v2ray-windows-64.zip`;
    let filename = `v2ray-${version}-windows-64.zip`;
    let extract_dir = `v2ray-${version}-windows-64`;
    let target_dir = 'v2ray-win';
    let executable_name = "v2ray.exe";
    return {url, filename, extract_dir, target_dir, executable_name};
  }
  if (platform === "darwin") {
    let url = `https://github.com/v2ray/v2ray-core/releases/download/${version}/v2ray-macos.zip`;
    let filename = `v2ray-${version}-macos.zip`;
    let extract_dir = `v2ray-${version}-macos`;
    let target_dir = 'v2ray-macos';
    let executable_name = "v2ray";
    return {url, filename, extract_dir, target_dir, executable_name};
  }
}

function switchIntoWorkSpace() {
  // Create v2ray if not exists and enter the folder
  let dir = '../assets/v2ray';
  if (!fs.existsSync(dir)) {
    fs.ensureDirSync(dir);
  }
  process.chdir(dir);
}

function cleanUpOldFiles(params) {
  removeIfExists(params.target_dir);
  removeIfExists(params.extract_dir);
}

function alreadyExists(params) {
  return fs.existsSync(params.filename);
}

function removeIfExists(path) {
  if (fs.existsSync(path)) {
    fs.removeSync(path);
  }
}

function download(params) {
  console.log("Downloading ", params.url);
  request(params.url).pipe(fs.createWriteStream(params.filename)).on('finish', () => {
    unzipAndMove(params)
  })
}

function unzipAndMove(params) {
  fs.createReadStream(params.filename)
  .pipe(unzipper.Extract({ path: `${process.cwd()}/${params.extract_dir}` }))
  .on('finish', () => {
    fs.renameSync(`./${params.extract_dir}/config.json`, `./${params.extract_dir}/config.json.default`);
    // Avoid "EPERM: operation not permitted" on Windows
    setTimeout(function() {
      fs.renameSync(`./${params.extract_dir}`, `./${params.target_dir}`);
    }, 1000);
  });
}

function runningOnTravis() {
  return 'TRAVIS' in process.env && 'CI' in process.env;
}