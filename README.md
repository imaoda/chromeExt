## introduction

A chrome extention for personal use

## get started

#### popup

用户界面仅保留插件开关，点击开关，会计入 storage

#### 配置 js

本方案完全依赖于后端配置，在 node 后端针对域名配置 script，即可生效

比如想对包含 huiyi 的网址注入脚本，只需在 node 服务路径下 /static/chromes/huiyi/index.js 中写脚本内容即可
