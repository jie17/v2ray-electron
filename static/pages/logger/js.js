const MAX_LINE_NUMBER = 1024;
let store = [];

function isScrollEnd() {
  let body = document.body;
  return body.scrollTop + body.clientHeight === body.scrollHeight;
}

require("electron").ipcRenderer.on("log", (event, lines) => {
  let scrollEnd = isScrollEnd();
  let div = document.getElementById("container");
  store = [...store, ...lines];
  if (store.length > MAX_LINE_NUMBER) {
    store = store.slice(store.length - MAX_LINE_NUMBER);
  }
  div.innerHTML = store.join("\n");
  if (scrollEnd) {
    let body = document.body;
    body.scrollTop = body.scrollHeight;
  }
});
