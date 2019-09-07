const initialState = { open: false }; // 安装插件的时候，给与的初始值

// {state, setState, sendMsgToCurrentPage} 可通过 chrome.extension.getBackgroundPage() 暴露给 popup.js (需要暴露的值只需用 var 定义即可)
var state = JSON.parse(JSON.stringify(initialState));
// 交给 popup 调用，把开关选项更新到 state/storage
function setState(newState, cb = () => { }) {
  state = { ...state, ...newState };
  chrome.storage.sync.set(state, cb);
}

// 主动通知 content.js
function sendMsgToCurrentPage(msg, currentWindowId = null, cb = () => { }) {
  // 通常无需传 id，及时获取即可，但在 mac 有种异常，就是开着 popup 的时候切到另外一个屏上，另外一个屏也打开了 chrome，再回来就出 bug了 
  if (currentWindowId) chrome.tabs.sendMessage(currentWindowId, msg, (res) => {
    cb(res)
  });
  else chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, msg, (res) => {
      cb(res)
    });
  });
}

// 解决 mac 切屏引起 bug，让 popup 在建立时候记住其关联的 page
function getCurrentTab(cb) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    cb(tabs[0])
  });
}

// 重启 chrome 后，从 storage 里同步 (兼容首次安装 undefined 场景)
const keys = Object.keys(initialState)
chrome.storage.sync.get(keys, data => {
  keys.forEach(k => {
    state[k] = data[k] === undefined ? initialState[k] : data[k]
  })
});

// 被动回复 content.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  sendResponse(state.open); // 如需在异步中调用，则先 return true
});



