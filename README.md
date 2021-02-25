## introduction

谷歌插件模板，打造自己的高效办公工具，需配合 node 后端使用

- 极强的扩展性
- 能满足绝大多数插件应用场景
- 清晰的结构
- 可针对不同网站，生成不同的 popup
- 可根据不同网站，注入不同的 content

纯动态化方案，一旦有调整，无需更新 chrome 插件，只需简单调整后端 (node 侧)，即可实时生效

- popup 界面可后端控制
- content 注入可后端控制

## get started

#### popup

用户界面保留插件开关，点击开关，会计入 storage

可自定义命令(需后端配置)

#### 配置 js

本方案完全依赖于后端配置，在 node 后端针对域名配置 script，即可生效

比如想对包含 huiyi 的网址注入脚本，只需在 node 服务路径下 /static/chromes/huiyi/index.js 中写脚本内容即可

#### 更新记录

移除了 declarativeContent 权限

`"matches": ["*://*/*"],` 改为 `"matches": ["*://*/*"],`

#### 开发调试技巧

打开 background 甚至可以打断点
