var bg = chrome.extension.getBackgroundPage(); // 获取 background 的完整引用，里面 var function 的引用可暴露出来
var pageId = null
bg.getCurrentTab(tab => pageId = tab.id)
// 使用 umd 形式的 Vue 时，其使用 eval 被 chrome 默认 csp 拦截，需要在 manifest 中开启 "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'"
new Vue({
  el: '#app',
  data: () => ({
    open: bg.state.open,
    commandList: [],
  }),
  mounted() {
    // 请求后端，获取自定义指令(如果配置了的话)
    bg.getCurrentTab(tab => {
      fetch("https://bapi.imaoda.com/script/commands?domain=" + encodeURIComponent(tab.url.split('#')[0].split('?')[0])).then(i => i.json()).then(d => {
        if (d instanceof Array) this.commandList = d // 诸如：[{command:'send', description: '发送提醒'}] 与 content 中插入的 script 配合使用
      });
    })
  },
  methods: {
    toggle() {
      this.open = !this.open
      bg.setState({ open: this.open })
    },
    sendMsg() {
      bg.sendMsgToCurrentPage({ msg: '你好啊', command: 'echo' }, pageId, (msg) => {
        console.log('页面回复的消息', msg)
      })
    },
    trigger(command) {
      bg.sendMsgToCurrentPage({ msg: '准备触发指令', command }, pageId, (msg) => {
        console.log('页面回复的消息', msg)
      })
    }
  }
})
