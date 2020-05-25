// content 主动联系 background
chrome.runtime.sendMessage({ name: "wyf" }, (res) => {});

// content 监听 background 的消息
chrome.runtime.onMessage.addListener((requestMsg, sender, sendResponse) => {
  sendResponse(""); // 即使不返回，也调用一下该函数，否则一些场景下 chrome 会报 message port closed before a response was received

  // 可在自定义脚本里为 window 注入回调，popup 发送消息中如果带  {command} 指令，则会执行回调，而回调预先在页面里 __chromeExt.xxx 上绑定，xxx 即 command 名称
  if (typeof requestMsg.command === "string") {
    console.log("触发自定义命令:" + requestMsg.command);

    if (requestMsg.command === "ajax_interceptor") {
      // 由 content 内部处理，无需交给外部
      openInterceptor();
      return;
    }

    sendCommandToHTML(`if (window.__chromeExt && typeof __chromeExt.${requestMsg.command} === 'function') {
      __chromeExt.${requestMsg.command}()
    }`);
  }
  /**
   * 注：content 里的 window 和 document 与原页面的是独立的，只在 dom 操作时候是对应相同的，因此需以 script 形式插入函数调用
   */
});

function sendCommandToHTML(str) {
  const scriptDom = document.createElement("script");
  scriptDom.innerHTML = str;
  document.head.appendChild(scriptDom);
  // 执行完成后清理现场
  setTimeout(() => {
    try {
      document.documentElement.removeChild(scriptDom);
    } catch (error) {}
  }, 200);
}

// 读取 storage
chrome.storage.sync.get(["open"], (data) => {
  if (data.open) init();
});

function init() {
  // 拦截器部分，需要在页面初始化时直接插入
  const script1 = document.createElement("script");
  script1.setAttribute(
    "src",
    chrome.extension.getURL("umd/ajax-interceptor.js")
  );
  script1.setAttribute("async", "async"); // ！！！一定要带 async，否则拦截器代码会排到最后一个同步 script，此时接口可能已经发出去了，导致接口拦截器拦截不到一开始的几个请求
  document.head.appendChild(script1);

  // console 里执行一样自由。无论是以 script src 的形式植入，还是 ajax 获取内容植入，都有可能被 csp 拦截
  const script = document.createElement("script");
  fetch(
    "https://bapi.imaoda.com/script?domain=" +
      encodeURIComponent(location.hostname + location.pathname)
  )
    .then((i) => i.text())
    .then((d) => {
      script.innerHTML = "\n" + d;
      document.head.appendChild(script);
    });
}

let pageInserted = false;
function openInterceptor() {
  if (pageInserted) {
    sendCommandToHTML(
      "if(window._open_interceptor_page_) _open_interceptor_page_()"
    );
  } else {
    pageInserted = true;
    const script = document.createElement("script");
    script.setAttribute("src", chrome.extension.getURL("umd/ajax-page.js"));
    document.head.appendChild(script);
  }
}

// 【暂未启用】插件路径资源，比如插件中有个 dist 文件夹，则我们可以获取这个 dist/index.html 的地址，并借助 script 插入，当然，目前的后端接口返回插入更强大，除非真正需要在初始化就插入的，比如请求拦截
// chrome.extension.getURL('dist/index.html')
// 插入 iframe 页面，并采用 iframe 通信，也是一个很好的实践， postMessage 即便是在非 iframe 场景，也可以被监听到
