const initialState = { open: false }; // 安装插件的时候，给与的初始值

// {state, setState, sendMsgToCurrentPage} 可通过 chrome.extension.getBackgroundPage() 暴露给 popup.js (需要暴露的值只需用 var 定义即可)
var state = JSON.parse(JSON.stringify(initialState));
// 交给 popup 调用，把开关选项更新到 state/storage
function setState(newState, cb = () => {}) {
  state = { ...state, ...newState };
  chrome.storage.sync.set(state, cb);
}

// 主动通知 content.js
function sendMsgToCurrentPage(msg, currentWindowId = null, cb = () => {}) {
  // 通常无需传 id，及时获取即可，但在 mac 有种异常，就是开着 popup 的时候切到另外一个屏上，另外一个屏也打开了 chrome，再回来就出 bug了
  if (currentWindowId)
    chrome.tabs.sendMessage(currentWindowId, msg, (res) => {
      cb(res);
    });
  else
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, msg, (res) => {
        cb(res);
      });
    });
}

// 解决 mac 切屏引起 bug，让 popup 在建立时候记住其关联的 page
function getCurrentTab(cb) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    cb(tabs[0]);
  });
}

// 重启 chrome 后，从 storage 里同步 (兼容首次安装 undefined 场景)
const keys = Object.keys(initialState);
chrome.storage.sync.get(keys, (data) => {
  keys.forEach((k) => {
    state[k] = data[k] === undefined ? initialState[k] : data[k];
  });
});

// 被动回复 content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse(state.open); // 如需在异步中调用，则先 return true
});

// 响应页面在 manifest 里预设的快捷键，并发送命令给 content
chrome.commands.onCommand.addListener((command) => {
  sendMsgToCurrentPage({ command }); // demoCmd
});

// 【暂未启用】点击 icon 的时候触发，暂未启用
chrome.browserAction.onClicked.addListener(function (tab) {
  // 比如调用 sendMsgToCurrentPage 向 content 发送信息
});

/**
|--------------------------------------------------
| 更多能力
|--------------------------------------------------
*/

/**
 * 根据快捷键，激活 tab https://developer.chrome.com/extensions/user_interface#commands
 */

// 网络请求代理 参考 http://www.kkh86.com/it/chrome-extension-doc/extensions/webRequest.html#event-onBeforeRequest
// chrome.webRequest.onBeforeRequest.addListener(
//   function (details) {
//     var matches = details.url.match(/vodka-l(.+)\.js/);
//     if (matches) {
//       var id = matches[1];
//       return {
//         redirectUrl: `https://h3.static.yximgs.com/udata/pkg/IS-DOCS-VODKA-FRAME/assets/js/editor-vodka-l${id}.js`,
//       };
//     }
//   },
//   { urls: ["*://h3.static.yximgs.com/*"] },
//   ["blocking"]
// );
// 上面的方案对 .map 文件无效，另外，开这个特性需要加入 manifest.permissions 中加入     "webRequest", "webRequestBlocking"
// 第三方插件，我们在 background 审查获取他们的源代码！！！！
