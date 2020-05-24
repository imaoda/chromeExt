(function () {
  const container = document.createElement("div");
  container.style =
    "display:block; position: fixed; z-index: 10000; top:0; right:0; padding: 10px; border: 1px solid rgba(0,0,0,0.2); height: 100%; width: 400px; background-color: rgba(255,255,255,0.9); font-size: 12px; display: flex; flex-flow: column; align-items: center";

  // toggle
  const tip = document.createElement("div");
  tip.innerHTML = "是否开启网络拦截？";
  container.appendChild(tip);
  const radio = document.createElement("input");
  tip.style = "padding: 10px; cursor: pointer;";
  radio.type = "checkbox";
  radio.name = "ajax";
  // radio.checked = localStorage.getItem("ajax_interceptor") > 0 ? "checked" : "";
  setRadio();
  tip.onclick = () => {
    toggle();
  };

  function setRadio() {
    let isOn = localStorage.getItem("ajax_interceptor") > 0;
    toggle(!isOn);
  }

  function toggle(current) {
    if (typeof current === "undefined") current = radio.getAttribute("checked");
    if (current) {
      localStorage.setItem("ajax_interceptor", "0");
      radio.removeAttribute("checked");
    } else {
      localStorage.setItem("ajax_interceptor", "1");
      radio.setAttribute("checked", "checked");
    }
  }
  tip.appendChild(radio);

  const eg = document.createElement("div");
  eg.innerHTML =
    '格式为: [{closed: false, match:"/api", text:{}, path:"data:userid"}]; 其中 text 可为 str 或者 obj， path 可选';
  container.appendChild(eg);

  // 按钮

  const menu = document.createElement("div");
  menu.style = "display:flex; justify-content: center";
  const button1 = document.createElement("button");
  button1.innerHTML = "确定";
  button1.style =
    "display: block; margin: 0 auto; padding: 5px 10px; background-color: #3371ff; color: white; padding: 10px";
  button1.onclick = () => {
    setStorage();
  };
  menu.appendChild(button1);
  const button2 = document.createElement("button");
  button2.innerHTML = "取消";
  button2.style =
    "display: block; margin: 0 auto; padding: 5px 10px; padding: 10px";
  button2.onclick = () => window._close_interceptor_page_();
  menu.appendChild(button2);
  container.appendChild(menu);

  window._open_interceptor_page_ = function () {
    document.documentElement.appendChild(container);
    getStorage();
    setRadio();
  };
  window._close_interceptor_page_ = function () {
    document.documentElement.removeChild(container);
  };

  // texarea
  const input = document.createElement("textarea");
  input.cols = "60";
  input.rows = "55";
  input.style = "margin: 10px 0px;";
  container.appendChild(input);
  getStorage();
  function getStorage() {
    const str = localStorage.getItem("ajax_interceptor_rules");
    try {
      input.value = JSON.stringify(JSON.parse(str), true, 2);
    } catch (error) {}
  }

  function setStorage() {
    const value = input.value;
    var inputStr = "";
    try {
      eval("inputStr = " + value);
    } catch (error) {
      alert("JSON 格式不对");
      return;
    }
    if (!Array.isArray(inputStr)) {
      alert("格式错误，应为数组");
      return;
    }
    inputStr.forEach((item) => {
      if (typeof item.text === "string") {
        // try {
        //   item.text = JSON.parse(item.text);
        // } catch (e) {}
      }
    });
    localStorage.setItem("ajax_interceptor_rules", JSON.stringify(inputStr));
    input.value = JSON.stringify(inputStr, true, 2);
  }

  document.documentElement.appendChild(container);
})();
