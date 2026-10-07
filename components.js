(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function feedbackBadge(kind) {
    const labels = window.COURSE_DATA.feedbackKinds;
    return `<span class="feedback-kind kind-${escapeHtml(kind)}">${escapeHtml(labels[kind] || kind)}</span>`;
  }

  function feedbackPanel(results, options = {}) {
    const passed = (results || []).filter((item) => item.pass);
    const failed = (results || []).filter((item) => !item.pass);
    const title = options.title || (failed.length ? `待修改 ${failed.length} 项` : "这一步已满足规则");
    return `
      <section class="feedback-panel ${failed.length ? "has-errors" : "is-ready"}" id="feedback-summary" tabindex="-1" aria-labelledby="feedback-title">
        <div class="panel-heading">
          <div><span class="eyebrow">规则透明的反馈</span><h2 id="feedback-title">${escapeHtml(title)}</h2></div>
          <span class="status-word">${failed.length ? "待修改" : "可保存"}</span>
        </div>
        ${passed.length ? `<div class="feedback-group"><h3>已满足</h3><ul>${passed.map((item) => `<li><span aria-hidden="true">✓</span> ${feedbackBadge(item.kind)} ${escapeHtml(item.message)}</li>`).join("")}</ul></div>` : ""}
        ${failed.length ? `<div class="feedback-group"><h3>待修改 · 为什么 · 怎么改</h3><ol>${failed.map((item) => `<li><a href="#${escapeHtml(item.field)}"><strong>${escapeHtml(item.message)}</strong></a><p>${escapeHtml(item.fix)}</p>${feedbackBadge(item.kind)}</li>`).join("")}</ol></div>` : ""}
        <p class="human-note">${feedbackBadge("human_verification")} 系统只检查结构与固定案例范围；事实真伪、业务判断和最终发布仍由人负责。</p>
      </section>`;
  }

  function saveBanner(state) {
    const meta = state.saveMeta || {};
    if (meta.mode === "session") {
      return `<section class="notice notice-warning" role="status"><strong>本次会话模式</strong><span>浏览器没有保存权限；输入仍在当前页面内存中。请复制作品或重试保存。</span><div class="inline-actions"><button class="btn-secondary" data-copy-state>复制当前作品</button><button class="btn-secondary" data-retry-storage>重试保存</button></div></section>`;
    }
    const time = meta.lastSavedAt ? new Date(meta.lastSavedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "尚未保存";
    return `<span class="save-status" role="status" aria-live="polite"><span aria-hidden="true">●</span> 已自动保存 ${escapeHtml(time)}</span>`;
  }

  function regularShell(active, content) {
    const structure = window.COURSE_STRUCTURE || {};
    const articles = (window.LEARNING_ARTICLES || []).filter((item) => item.visible === true);
    let currentPath = "";
    try { currentPath = decodeURIComponent(location.hash.replace(/^#\/read\//, "")); } catch (_) {}
    const current = articles.find((item) => item.path === currentPath);
    const href = (item) => `#/read/${encodeURIComponent(item.path)}`;
    const shortNames = {
      "C-01": "AI 的能力与责任", "C-02": "模型怎样生成回答", "C-03": "能力边界与人机分工",
      "C-04": "定义一项协作任务", "C-05": "选择上下文材料", "C-06": "示例、反馈与迭代",
      "C-07": "资料研究", "C-08": "长文总结", "C-09": "会议纪要", "C-10": "PPT 大纲",
      "C-11": "事实核查", "C-12": "风险与发布边界", "C-13": "把做法变成 Workflow",
      "C-14": "设计轻量 Eval", "C-15": "什么时候需要 Agent", "C-16": "整理 Skill 与案例",
      "A-01": "从 Prompt 到 Harness", "A-02": "Agent Loop 与状态", "A-03": "上下文与长任务",
      "A-04": "工具权限与安全", "A-05": "Skill 与多 Agent 分工", "A-06": "Eval 与持续改进",
      "A-07": "建设能力资产", "A-08": "最小 Harness",
      "R-01": "Embedding 与语义检索", "R-02": "入门术语地图", "R-03": "按任务选择工具",
      "R-04": "理解 AIGC", "R-05": "使用者与建设者"
    };
    const links = (items) => items.map((item) => `<a class="course-side-lesson" href="${href(item)}" title="${escapeHtml(item.title)}" ${item.path === currentPath ? 'aria-current="page"' : ""}>${escapeHtml(shortNames[item.unitId] || item.title)}</a>`).join("");
    const modules = structure.core?.modules || [];
    const moduleNames = ["建立 AI 判断", "任务与材料", "常见工作交付", "核查与风险", "流程与方法"];
    const catalog = modules.map((module, index) => {
      const items = module.units.map((unit) => articles.find((item) => item.path === unit.path)).filter(Boolean);
      const selected = items.some((item) => item.path === currentPath);
      return `<details class="course-side-group" data-catalog-group="${module.moduleId}" ${selected || (!current && index === 0) ? "open" : ""}><summary><span class="course-side-number">${String(index + 1).padStart(2, "0")}</span>${moduleNames[index] || escapeHtml(module.title)}</summary><div>${links(items)}</div></details>`;
    }).join("");
    const advanced = articles.filter((item) => item.layer === "advanced");
    const references = articles.filter((item) => item.layer === "reference");
    const labels = { learn: "课程地图", directory: "学习路线", reference: "知识检索", practice: "案例与练习" };
    const crumb = current ? (current.courseModuleTitle || (current.layer === "advanced" ? "进阶工程课" : "按需阅读")) : labels[active];
    return `
      <aside class="course-sidebar" id="course-sidebar" aria-label="课程目录">
        <a class="brand" href="#/home"><span class="brand-mark" aria-hidden="true">AI</span><span><strong>AI 协作入门课</strong><small>A GUIDE TO WORKING WITH AI</small></span></a>
        <button class="course-menu-close" data-menu-close aria-label="关闭目录">×</button>
        <button class="course-side-search" data-search-open><span aria-hidden="true">⌕</span> 搜索课程内容 <kbd>⌘ K</kbd></button>
        <nav class="course-side-nav" aria-label="主导航">
          <a class="course-side-main" href="#/home" ${!current && active === "learn" ? 'aria-current="page"' : ""}>课程地图</a>
          <a class="course-side-main" href="#/directory" ${!current && active === "directory" ? 'aria-current="page"' : ""}>完整学习路线</a>
          <p class="course-side-label">核心入门 · 16 节</p>${catalog}
          <p class="course-side-label">需要时，再深入</p>
          <details class="course-side-group" data-catalog-group="advanced" ${current?.layer === "advanced" ? "open" : ""}><summary>进阶工程课 <span class="course-side-count">8</span></summary><div>${links(advanced)}</div></details>
          <details class="course-side-group" data-catalog-group="reference" ${current?.layer === "reference" ? "open" : ""}><summary>概念与参考 <span class="course-side-count">5</span></summary><div>${links(references)}</div></details>
          <a class="course-side-main course-side-utility" href="#/reference" ${!current && active === "reference" ? 'aria-current="page"' : ""}>知识检索 <span aria-hidden="true">↗</span></a>
          <a class="course-side-main course-side-utility" href="#/lab" ${!current && active === "practice" ? 'aria-current="page"' : ""}>案例与可选练习 <span aria-hidden="true">↗</span></a>
          <a class="course-side-main course-side-utility" href="#/portfolio">我的练习记录 <span aria-hidden="true">↗</span></a>
        </nav><p class="course-side-foot">按自己的节奏读，练习随时可选。</p>
      </aside>
      <button class="course-menu-backdrop" data-menu-close aria-label="关闭目录" hidden></button>
      <header class="topbar course-topbar">
        <button class="course-menu-button" data-menu aria-expanded="false" aria-controls="course-sidebar" aria-label="打开课程目录">☰</button>
        <span class="course-breadcrumb">${current ? `<a href="#/home">课程地图</a><span aria-hidden="true"> / </span>` : ""}${escapeHtml(crumb || "课程地图")}</span>
        <div class="course-reading-tools"><button data-font-change="-1" aria-label="减小字号">A−</button><button data-font-change="1" aria-label="增大字号">A+</button><button data-search-open aria-label="搜索课程内容">搜索</button></div>
      </header>
      ${content}
      <dialog class="course-search-dialog" aria-labelledby="course-search-title"><div class="course-search-head"><label id="course-search-title" for="course-search-input">全课程搜索</label><input id="course-search-input" type="search" placeholder="搜索一个概念或问题" autocomplete="off"><button data-search-close aria-label="关闭搜索">关闭</button></div><p class="course-search-status" role="status"></p><div class="course-search-results"></div></dialog>`;
  }

  function focusShell(stageLabel, content, state) {
    return `
      <header class="focusbar">
        <a href="#/lab" class="back-link">← 退出练习</a>
        <strong>${escapeHtml(stageLabel)}</strong>
        ${saveBanner(state)}
      </header>
      ${content}`;
  }

  function stageSpine(currentId, compact) {
    const stages = window.COURSE_DATA.stages;
    const currentIndex = stages.findIndex((item) => item.id === currentId);
    return `<ol class="stage-spine ${compact ? "compact" : ""}" aria-label="能力路线">${stages.map((stage, index) => {
      const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "future";
      return `<li class="${state}"><span class="stage-dot" aria-hidden="true">${state === "done" ? "✓" : index + 1}</span><span><strong>${escapeHtml(stage.title)}</strong><small>${escapeHtml(stage.short)}</small></span>${state === "current" ? '<span class="sr-only">当前阶段</span>' : ""}</li>`;
    }).join("")}</ol>`;
  }


  function artifactSummary(artifact) {
    if (!artifact) return `<section class="artifact-panel"><span class="eyebrow">作品</span><h2>尚未形成作品</h2><p>完成当前任务并通过 required 条件后，这里会保存可复用证据。</p></section>`;
    const labels = { draft: "草稿", needs_revision: "待修改", ready_to_save: "可保存", passed: "已通过" };
    return `<section class="artifact-panel"><div class="panel-heading"><div><span class="eyebrow">作品证据</span><h2>${escapeHtml(artifact.title || artifact.id)}</h2></div><span class="status-word">${escapeHtml(labels[artifact.status] || artifact.status)}</span></div><dl class="artifact-meta"><div><dt>作品 ID</dt><dd>${escapeHtml(artifact.id)}</dd></div><div><dt>版本</dt><dd>v${escapeHtml(artifact.version || 1)}</dd></div><div><dt>下次复用</dt><dd>${escapeHtml(artifact.nextUse || "下一学习阶段")}</dd></div></dl></section>`;
  }

  function unknownInteraction(block) {
    return `<section class="notice notice-warning" role="status"><strong>这个练习在当前版本不可用</strong><span>${escapeHtml(block && block.textAlternative || "你可以继续阅读相关知识，稍后再回来练习。")}</span><a href="#/directory">返回学习路线</a></section>`;
  }

  window.CourseComponents = { escapeHtml, feedbackBadge, feedbackPanel, saveBanner, regularShell, focusShell, stageSpine, artifactSummary, unknownInteraction };
})();
