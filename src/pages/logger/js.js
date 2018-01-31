require('electron').ipcRenderer.on('log', (event, message) => {
  let scrollEnd = isScrollEnd();
  let div = document.getElementById('container')
  div.innerHTML = div.innerHTML + message
  if (scrollEnd) {
    let body = document.body;
    body.scrollTop = body.scrollHeight;
  }
})

function isScrollEnd() {
  let body = document.body;
  return body.scrollTop + body.clientHeight === body.scrollHeight;
}