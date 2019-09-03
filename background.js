var initialState = { open: false }; // 安装插件的时候，给与的初始值
var state = { open: false }; // 存放后台全局变量，注意必须用 var，才能被 popup 处获取
// 浏览器启动的时候执行
chrome.runtime.onInstalled.addListener(function() {
  // 加载 storage 中存储的选项
  getStateFromStorage();
  // 在哪些场合，popup 是可用的
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            css: ["div"] // 这个规则几乎把所有页面都放开了，css: ["input[type='password']"]  可过滤有密码的页面
          }),
          new chrome.declarativeContent.PageStateMatcher({
            // 可增加多条规则，如匹配性的
            pageUrl: { hostEquals: "developer.chrome.com" }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});

// 交给 popup 调用，把开关选项更新到 state/storage
function setState(newState, cb = () => {}) {
  state = { ...state, ...newState };
  chrome.storage.sync.set(state, cb);
}

// 重启 chrome 后，从 storage 里读取缓存的用户选项
function getStateFromStorage() {
  let keys = Object.keys(initialState);
  let isFirstInstall = false;
  chrome.storage.sync.get(keys, data => {
    keys.forEach(key => {
      if (data[key] === undefined) {
        isFirstInstall = true;
      }
    });
    if (isFirstInstall) {
      state = JSON.parse(JSON.stringify(initialState));
      chrome.storage.sync.set(initialState);
    } else {
      state = data;
    }
  });
}

// 监听页面 content.js 发来的信息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse(state.open);
});
