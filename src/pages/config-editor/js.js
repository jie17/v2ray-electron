const loader = require('monaco-loader')
const fs = require('fs')
// const monaco = require('monaco-editor')

let editor = null;
let filename = "resources/v2ray/config.json"
let defaultFilename = "resources/v2ray/config.json.default"

loader().then((monaco) => {
  editor = monaco.editor.create(document.getElementById('container'), {
    language: 'json',
    theme: 'vs',
    automaticLayout: true
  })
  
  fs.readFile(filename, 'utf-8', (err, data) => {
    editor.setModel(this.monaco.editor.createModel(data, 'javascript'));
    // monaco.editor.create(document.getElementById("container"), {
    //   value: data,
    //   language: "json"
    // });
  });
})

function save() {
  const model = editor.getModel();
  let data = '';

  model._lines.forEach((line) => {
    data += line.text + model._EOL;
  });

  fs.writeFile(filename, data, 'utf-8');
}

function loadDefault() {
  fs.readFile(defaultFilename, 'utf-8', (err, data) => {
    editor.setModel(this.monaco.editor.createModel(data, 'javascript'));
  });
}