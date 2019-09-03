/**
 * 仅用于控制一对开关
 */

var bg = chrome.extension.getBackgroundPage(); // 获取 background 的完整引用

let domOn = document.querySelector("#on");
let domOff = document.querySelector("#off");

function toggle(type) {
  bg.setState({ open: type });
  domOff.checked = !type;
  domOn.checked = type;
}

domOn.onclick = () => toggle(true);
domOff.onclick = () => toggle(false);

bg.state.open ? (domOn.checked = true) : (domOff.checked = true);
