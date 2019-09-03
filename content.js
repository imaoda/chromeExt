// 每当打开新页面时，立即执行下面的代码，我们首先借助 background 获取 storage 里开关信息，判断开关是否开启
chrome.runtime.sendMessage({ greeting: "hello" }, function(response) {
  response && init();
});

// 如果开关开启，则执行下面的代码，就仿佛是在 chrome 的 console 里执行一样
function init() {
  // 植入脚本
  let script = document.createElement("script");
  // 也可以直接 script src 形式插入，不过容易被 csp，下面这个方案有些也会把 ajsx csp 了
  fetch(
    "https://bapi.imaoda.com/script?domain=" +
      encodeURIComponent(location.hostname + location.pathname)
  )
    .then(i => i.text())
    .then(d => {
      script.innerHTML = "\n" + d;
      document.body.append(script);
    });
}
