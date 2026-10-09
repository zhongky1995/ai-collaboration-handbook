# 访问统计

在线阅读页接入 Umami，与「软件世界模型」「网络世界模型」共用维护者账号中的「开源知识库」统计站点。

[打开统计后台](https://cloud.umami.is/analytics/us/websites/79788f43-5c65-4279-8249-0d094eef04f3)

按路径 `/ai-collaboration-handbook/` 或标签 `ai-collaboration-handbook` 筛选本知识库。课文使用稳定的单元编号，例如 `/ai-collaboration-handbook/read/C-01`；后台同时记录完整课文标题。首页、学习路线和参考检索页分别计数，文章内的大纲跳转与同页重新绘制不重复计数。

## 记录的操作

- `search-open`：打开课程搜索。
- `search`：输入停顿 800 毫秒后记录一次，只有搜索词长度、结果数和搜索入口（课程搜索或参考检索）。
- `search-result-click`：点击搜索结果，只有目标课文编号。
- `resume-reading`：点击继续上次阅读，只有目标课文编号。
- `github-click`：点击 GitHub 链接。

不上传搜索词、练习答案、作品内容、本机阅读记录或存储数据，也不设置用户账号标识。来源网页只记录域名和路径，去除查询参数和片段。未知课文与异常网址只计入统一的不可用页面，不上传任意网址片段。

## 维护

公开的站点 ID 和域名、项目路径配置在 `index.html` 的 `analytics-config` 中，统计逻辑在 `analytics.js`，页面和搜索入口由 `app.js` 调用。修改后运行 `npm test`、`npm run build`、`npm run check`，再按原 GitHub Pages 流程发布。站点 ID 是网页公开使用的统计标识，不是账号凭据。

统计脚本只在指定的 HTTPS 域名与项目路径下加载。本地预览、离线阅读和其他域名上的副本不发送统计。尊重浏览器的 Do Not Track 设置；网络或拦截器阻止统计时，课程仍可正常阅读。

后台的 Overview 查看访客、浏览次数、来源和课文；Events 查看操作及其属性。维护者后台没有启用公开分享。访客数按工具规则估算，统计依赖浏览器成功加载脚本。

Fork 后请更换自己的站点配置，或将 `hostname` 设为空字符串关闭统计。

[Umami 文档](https://docs.umami.is/docs/collect-data) · [事件统计](https://docs.umami.is/docs/track-events)
