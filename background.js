var initialState = { open: false }; // 安装插件的时候，给与的初始值
var state = { open: false }; // 存放后台全局变量，注意必须用 var，才能被 popup 处获取

// 重启 chrome 后，从 storage 里读取缓存的用户选项
chrome.storage.sync.get(["open"], data => (state.open = !!data.open));

// 交给 popup 调用，把开关选项更新到 state/storage
function setState(newState, cb = () => {}) {
  state = { ...state, ...newState };
  chrome.storage.sync.set(state, cb);
}

// 监听页面 content.js 发来的信息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse(state.open);
});

// 插件首次安装的时候执行
chrome.runtime.onInstalled.addListener(function() {
  // 在哪些场合，popup 是可用的
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({ css: ["div"] })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});
