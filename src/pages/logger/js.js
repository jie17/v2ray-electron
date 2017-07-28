require('electron').ipcRenderer.on('log', (event, message) => {
  let div = document.getElementById('container')
  div.innerHTML = div.innerHTML + message
})