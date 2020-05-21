// content 主动联系 background
chrome.runtime.sendMessage({ name: "wyf" }, (res) => {});

// content 监听 background 的消息
chrome.runtime.onMessage.addListener((requestMsg, sender, sendResponse) => {
  sendResponse(""); // 即使不返回，也调用一下该函数，否则一些场景下 chrome 会报 message port closed before a response was received

  // 可在自定义脚本里为 window 注入回调，popup 发送消息中如果带  {command} 指令，则会执行回调，而回调预先在页面里 __chromeExt.xxx 上绑定，xxx 即 command 名称
  if (typeof requestMsg.command === "string") {
    console.log("触发自定义命令:" + requestMsg.command);
    const scriptDom = document.createElement("script");
    scriptDom.innerHTML = `if (window.__chromeExt && typeof __chromeExt.${requestMsg.command} === 'function') {
      __chromeExt.${requestMsg.command}()
    }`;
    document.documentElement.appendChild(scriptDom);
  }
  /**
   * 注：content 里的 window 和 document 与原页面的是独立的，只在 dom 操作时候是对应相同的，因此需以 script 形式插入函数调用
   */
});

// 读取 storage
chrome.storage.sync.get(["open"], (data) => {
  if (data.open) init();
});

function init() {
  // console 里执行一样自由。无论是以 script src 的形式植入，还是 ajax 获取内容植入，都有可能被 csp 拦截
  const script = document.createElement("script");
  fetch(
    "https://bapi.imaoda.com/script?domain=" +
      encodeURIComponent(location.hostname + location.pathname)
  )
    .then((i) => i.text())
    .then((d) => {
      script.innerHTML = "\n" + d;
      document.body.appendChild(script);
    });
}
