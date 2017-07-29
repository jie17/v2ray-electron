const loader = require('monaco-loader')
const fs = require('fs')
const {process, remote} = require('electron')
const path = require('path')

// const monaco = require('monaco-editor')

global.ROOT = path.join(__dirname, '..', '..', '..')

console.log(global.ROOT)

let editor = null;
let configPath = path.join(remote.app.getPath('userData'), "v2ray.json")
let defaultConfigPath = path.join(global.ROOT, 'assets', 'v2ray', 'config.json.default');

loader().then((monaco) => {
  editor = monaco.editor.create(document.getElementById('container'), {
    language: 'json',
    theme: 'vs',
    automaticLayout: true
  })
  
  fs.readFile(configPath, 'utf-8', (err, data) => {
    editor.setModel(this.monaco.editor.createModel(data, 'json'));
  });
})

function save() {
  const model = editor.getModel();
  let data = '';

  model._lines.forEach((line) => {
    data += line.text + model._EOL;
  });

  fs.writeFile(configPath, data, 'utf-8');
}

function loadDefault() {
  fs.readFile(defaultConfigPath, 'utf-8', (err, data) => {
    editor.setModel(this.monaco.editor.createModel(data, 'javascript'));
  });
}