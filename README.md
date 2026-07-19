# AI 协作知识库

一套面向非技术读者的中文 AI 通识与协作知识库。它以连续阅读为主，从 AI 基础、Prompt 与 Context，逐步讲到 Workflow、Agent、Harness、Eval 和能力资产。

在线阅读：<https://zhongky1995.github.io/ai-collaboration-handbook/>

## 适合谁

- 刚开始系统学习 AI，希望先建立正确理解的人；
- 已经使用对话式 AI，但输出质量不稳定的人；
- 想理解 Agent 与 Harness，而不想一开始就钻进代码的人；
- 需要为团队建立通用 AI 协作语言和培训材料的人。

## 阅读方式

打开网页后，直接选择“从第一篇开始阅读”。完整目录默认收起，案例和练习完全可选，不影响连续阅读。

知识主线是：

`Prompt → Template / Context → Workflow → Agent Loop → Harness → Skill / AgentOS`

## 仓库结构

- `content/`：68 篇 Markdown 正文；
- `content-index.json`：文章顺序和阅读属性；
- `learning-index.json`：知识路线和模块定义；
- `scripts/build-content.mjs`：从 Markdown 重新生成网页内容；
- 根目录的 HTML、CSS 和 JavaScript：无需后端的阅读应用。

## 本地阅读与更新

直接打开 `index.html` 即可阅读。修改 `content/` 后运行：

```bash
npm run build
npm run check
```

推送到 `main` 后，GitHub Pages 会自动更新公开网页。

## 内容边界

本项目提供通用学习框架和固定教学案例，不构成法律、医疗、财务或组织政策建议。事实、高风险判断和对外发布始终需要人负责。

## 许可

- 课程正文与配图： [CC BY-SA 4.0](LICENSE-CONTENT.md)；
- 网页代码： [MIT](LICENSE-CODE.md)。

