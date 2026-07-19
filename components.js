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
    const items = [
      ["learn", "学习首页", "#/home"], ["directory", "学习路线", "#/directory"], ["reference", "知识检索", "#/reference"], ["practice", "案例练习", "#/lab"]
    ];
    return `
      <header class="topbar">
        <a class="brand" href="#/home"><span class="brand-mark" aria-hidden="true">AI</span><span><strong>AI 协作知识库</strong><small>阅读、理解，再按需练习</small></span></a>
        <nav class="mode-nav" aria-label="主导航">${items.map(([id, label, href]) => `<a href="${href}" ${active === id ? 'aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
        <button class="menu-button" data-menu aria-expanded="false" aria-controls="mobile-nav">菜单</button>
      </header>
      <nav class="mobile-nav" id="mobile-nav" aria-label="移动端主导航" hidden>${items.map(([id, label, href]) => `<a href="${href}" ${active === id ? 'aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
      ${content}
      <nav class="bottom-nav" aria-label="移动端模式导航">${items.map(([id, label, href]) => `<a href="${href}" ${active === id ? 'aria-current="page"' : ""}>${label}</a>`).join("")}</nav>`;
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
