(function () {
  "use strict";

  const app = document.getElementById("app");
  const D = window.COURSE_DATA;
  const V = window.CourseValidators;
  const S = window.CourseStorage;
  const C = window.CourseComponents;
  const readingStages = [
    { id: "prompt", concept: "AI 与 Prompt", title: "先弄懂 AI 能做什么", question: "AI 为什么能快速生成内容，却仍然可能说错？", description: "先建立“不盲信，也不拒绝”的基本判断。" },
    { id: "context", concept: "Context", title: "让 AI 看对材料", question: "为什么材料选得对，比把所有资料都塞进去更重要？", description: "学会选择背景、版本、示例和必要信息。" },
    { id: "workflow", concept: "Workflow", title: "把复杂任务变成流程", question: "事情不止一步时，怎样让过程可以检查和恢复？", description: "把步骤、检查点、人工确认和异常写清楚。" },
    { id: "agent", concept: "Agent", title: "再判断要不要 Agent", question: "什么时候固定流程不够，需要 AI 根据结果选择下一步？", description: "先理解动态选择，再决定是否需要 Agent。" },
    { id: "harness", concept: "Harness", title: "让 Agent 安全稳定地工作", question: "AI 会调用工具后，怎样限制权限、记录过程并处理失败？", description: "用权限、验证、记录和恢复管理不确定性。" },
    { id: "asset", concept: "Skill / AgentOS", title: "把方法变成团队能力", question: "一次有效经验，怎样让别人也能安全复用和持续改进？", description: "把方法整理成可交接、可维护的能力资产。" }
  ];

  function stageJourney(activeStage) {
    return `<ol class="novice-route" aria-label="六步学习路线">${readingStages.map((stage, index) => `<li class="${stage.id === activeStage ? "current" : ""}" ${stage.id === activeStage ? 'aria-current="step"' : ""}><span class="novice-route-number">${index + 1}</span><div><span class="eyebrow">${C.escapeHtml(stage.concept)}</span><strong>${C.escapeHtml(stage.title)}</strong><p>${C.escapeHtml(stage.question)}</p></div></li>`).join("")}</ol>`;
  }

  function coreReadingSequence() {
    const stageOrder = new Map(readingStages.map((stage, index) => [stage.id, index]));
    return (window.LEARNING_ARTICLES || [])
      .filter((item) => item.pageType === "core-spine")
      .sort((a, b) => (stageOrder.get(a.stage) ?? 99) - (stageOrder.get(b.stage) ?? 99) || a.order - b.order);
  }

  function articleHref(article) {
    return article ? `#/read/${encodeURIComponent(article.path)}` : "#/directory";
  }

  function latestReading(state) {
    const entries = Array.isArray(state.readingHistory) ? state.readingHistory : [];
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      const path = typeof entries[index] === "string" ? entries[index] : entries[index] && entries[index].path;
      const article = (window.LEARNING_ARTICLES || []).find((item) => item.path === path && item.pageType === "core-spine");
      if (article) return article;
    }
    return null;
  }

  function route() {
    const raw = window.location.hash.replace(/^#/, "") || "/home";
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  function taskArtifact(state, create) {
    let artifact = state.artifacts["artifact-task-card-v1"] || state.drafts["artifact-task-card-v1"];
    if (!artifact && create) {
      const stamp = new Date().toISOString();
      artifact = {
        schemaVersion: 1,
        id: "artifact-task-card-v1",
        title: "资料研究简报任务卡",
        artifactType: "task-card",
        caseId: D.case.id,
        stage: "prompt",
        status: "draft",
        version: 1,
        fields: { goalAudience: "", goalUse: "", materials: [], outputShape: "", acceptanceCriteria: ["", "", ""], humanResponsibility: "" },
        criterionResults: [],
        feedbackRecords: [],
        courseRuleVersion: "v3.0",
        createdAt: stamp,
        updatedAt: stamp,
        nextUse: "上下文材料选择"
      };
      state.drafts[artifact.id] = artifact;
      state.milestones.prompt.status = "in_progress";
    }
    return artifact;
  }

  function renderHome() {
    const state = S.load();
    const sequence = coreReadingSequence();
    const recent = latestReading(state);
    const start = recent || sequence[0];
    const currentIndex = start ? sequence.findIndex((item) => item.path === start.path) : -1;
    const startLabel = recent ? `继续阅读：${recent.title}` : "从第一篇开始阅读";
    const stageRoute = stageJourney(start ? start.stage : "prompt");

    app.innerHTML = C.regularShell("learn", `
      <main id="main-content" class="container" data-route="home" data-home-state="reading-first">
        ${state.saveMeta.mode === "session" ? C.saveBanner(state) : ""}
        <section class="home-hero">
          <div class="home-copy">
            <span class="eyebrow">以阅读和理解为主的 AI 知识库</span>
            <h1>从理解 AI 开始，逐步读懂 Agent 与 Harness</h1>
            <p>你可以像读一本结构清楚的书一样学习，不需要先完成任务，也没有必须打卡的进度。案例、互动和练习只在你想验证理解时出现。</p>
            <div class="reading-promise"><strong>${C.escapeHtml(start ? start.title : "课程导读")}</strong><span>${recent ? `上次读到主线第 ${currentIndex + 1} 篇，继续即可。` : `约 ${start ? start.minutes : 8} 分钟，先建立第一层整体认识。`}</span></div>
            <div class="home-actions"><a class="btn-primary home-primary" data-primary-cta href="${articleHref(start)}">${C.escapeHtml(startLabel)}</a><a class="btn-secondary" href="#/directory">先看看学习路线</a></div>
          </div>
          <aside class="home-side"><span class="eyebrow">怎样使用</span><h2>按自己的节奏读</h2><ol class="gentle-steps"><li>沿六个阶段顺序阅读</li><li>遇到术语时使用知识检索</li><li>想动手时再打开案例练习</li></ol><p>阅读是主线，练习不是进入门槛。</p></aside>
        </section>
        <section class="secondary-section" aria-labelledby="reading-map-title">
          <div class="section-heading-row"><div><h2 id="reading-map-title">后面只会依次解决六个问题</h2><p>现在不用记住这些概念，顺着读下去就可以。</p></div><a href="#/directory">查看学习路线</a></div>
          ${stageRoute}
        </section>
        <section class="secondary-section low-pressure-paths" aria-labelledby="other-paths-title">
          <h2 id="other-paths-title">按需要进入</h2>
          <div class="mode-grid"><article class="mode-card"><span class="eyebrow">知识检索</span><h2>我只想查一个概念</h2><p>搜索模型、Embedding、RAG、上下文、Agent、Harness 与风险边界。</p><a href="#/reference">打开知识检索</a></article><article class="mode-card"><span class="eyebrow">案例与练习 · 可选</span><h2>我读完后想试一下</h2><p>查看研究、总结、会议、PPT 与 AIGC 案例；练习结果不影响阅读。</p><a href="#/lab">浏览案例练习</a></article></div>
        </section>
      </main>`);
    bindCommon();
  }

  function stepForArtifact(artifact) {
    if (artifact.status === "passed") return 4;
    if (artifact.status === "ready_to_save") return 4;
    if ((artifact.criterionResults || []).length) return 3;
    const f = artifact.fields;
    return f.goalAudience || f.goalUse || f.outputShape ? 2 : 1;
  }

  function renderStepper(current) {
    const labels = ["了解任务", "填任务卡", "检查修正", "保存作品"];
    return `<ol class="stepper" aria-label="首次任务步骤">${labels.map((label, index) => `<li class="${index + 1 < current ? "done" : index + 1 === current ? "current" : ""}"><span>${index + 1}</span><span>${label}</span></li>`).join("")}</ol>`;
  }

  function invalidFor(artifact, field) {
    return (artifact.criterionResults || []).some((item) => !item.pass && item.field === field) ? 'aria-invalid="true"' : "";
  }

  function renderFirstTask(focusFeedback) {
    const state = S.load();
    const artifact = taskArtifact(state, true);
    if (!state.drafts[artifact.id] && artifact.status !== "passed") state.drafts[artifact.id] = artifact;
    S.save(state);
    const f = artifact.fields;
    const currentStep = stepForArtifact(artifact);
    const isReady = artifact.status === "ready_to_save";
    const isPassed = artifact.status === "passed";
    const action = isPassed
      ? '<a class="btn-primary" data-primary-cta href="#/learn/stage/context">进入下一阶段：选择材料</a>'
      : isReady
        ? '<button class="btn-primary" data-primary-cta id="save-artifact">保存为第一份作品</button>'
        : '<button class="btn-primary" data-primary-cta id="check-task-card">检查任务卡</button>';

    const feedback = (artifact.criterionResults || []).length
      ? C.feedbackPanel(artifact.criterionResults, { title: isPassed ? "第一份作品已通过" : undefined })
      : `<section class="feedback-panel"><span class="eyebrow">反馈与作品</span><h2>尚未检查</h2><p class="muted">填写后选择“检查任务卡”。系统会区分结构检查、固定案例对照与需人工核验。</p></section>`;

    app.innerHTML = C.focusShell("Prompt · 第 1 份作品 · 约 18 分钟", `
      <main id="main-content" class="wide-container" data-route="first-task">
        ${state.saveMeta.mode === "session" ? C.saveBanner(state) : ""}
        ${isPassed ? '<section class="notice notice-success" tabindex="-1" id="save-success"><strong>第一份作品已保存</strong><span>目标、材料、输出、验收与人类责任已形成可复用证据。下一步不是多读文章，而是选择真正需要的上下文材料。</span></section>' : ""}
        ${renderStepper(currentStep)}
        <div class="workspace">
          <aside class="material-rail">
            <span class="eyebrow">固定教学材料</span><h2>资料包 4 项</h2>
            <p class="muted">这里的内容不是实时行业调查。</p>
            ${D.materials.slice(0, 4).map((item) => `<div class="material-mini"><strong>${C.escapeHtml(item.title)}</strong><small>${C.escapeHtml(item.source)}</small></div>`).join("")}
            
          </aside>
          <section class="form-panel">
            <header><span class="eyebrow">第 ${currentStep}/4 步 · 四格任务卡</span><h1>让任务从“帮我研究一下”变得可执行、可验收</h1><p>${C.escapeHtml(D.case.task)}</p></header>
            <form id="task-card-form" novalidate>
              <div class="field" id="goalAudience"><label for="goal-audience">1. 谁会使用这份简报？</label><input id="goal-audience" name="goalAudience" type="text" value="${C.escapeHtml(f.goalAudience)}" ${invalidFor(artifact, "goalAudience")}><p class="field-help">例如：团队负责人。</p></div>
              <div class="field" id="goalUse"><label for="goal-use">要用它做什么决定？</label><textarea id="goal-use" name="goalUse" ${invalidFor(artifact, "goalAudience")}>${C.escapeHtml(f.goalUse)}</textarea><p class="field-help">把“了解情况”改成一个真实决策。</p></div>
              <fieldset id="materials"><legend>2. 可使用哪些材料？</legend><div class="check-grid">${D.materials.slice(0, 4).map((item) => `<label class="check-card"><input type="checkbox" name="materials" value="${item.id}" ${f.materials.includes(item.id) ? "checked" : ""}><span><strong>${C.escapeHtml(item.title)}</strong><small>${C.escapeHtml(item.source)}</small></span></label>`).join("")}</div></fieldset>
              <div class="field" id="outputShape"><label for="output-shape">3. 输出长什么样？</label><textarea id="output-shape" name="outputShape" ${invalidFor(artifact, "outputShape")}>${C.escapeHtml(f.outputShape)}</textarea><p class="field-help">说明篇幅、结构与交付形式。</p></div>
              <fieldset id="acceptance-0"><legend>4. 怎样才算合格？至少三条</legend><div class="acceptance-list">${[0,1,2].map((index) => `<label><span class="sr-only">验收条件 ${index + 1}</span><input type="text" name="acceptance-${index}" value="${C.escapeHtml(f.acceptanceCriteria[index] || "")}" placeholder="验收条件 ${index + 1}" ${invalidFor(artifact, "acceptance-0")}></label>`).join("")}</div><p class="field-help">能否逐条判断“满足/不满足”？</p></fieldset>
              <div class="field" id="humanResponsibility"><label for="human-responsibility">5. 哪项判断必须由人负责？</label><textarea id="human-responsibility" name="humanResponsibility" ${invalidFor(artifact, "humanResponsibility")}>${C.escapeHtml(f.humanResponsibility)}</textarea><p class="field-help">例如：核验工具说法、敏感信息与最终发布。</p></div>
              <div class="form-actions"><button type="button" class="btn-secondary" id="fill-example">填入教学示例</button><button type="button" class="btn-secondary" data-copy-task>复制任务卡</button>${action}</div>
            </form>
          </section>
          <aside class="side-panel">${feedback}${C.artifactSummary(artifact)}</aside>
        </div>
      </main>`, state);
    bindFirstTask();
    bindCommon();
    if (focusFeedback) requestAnimationFrame(() => document.getElementById("feedback-summary")?.focus());
    if (isPassed) requestAnimationFrame(() => document.getElementById("save-success")?.focus());
  }

  function collectTaskFields() {
    const form = document.getElementById("task-card-form");
    const fd = new FormData(form);
    return {
      goalAudience: String(fd.get("goalAudience") || "").trim(),
      goalUse: String(fd.get("goalUse") || "").trim(),
      materials: fd.getAll("materials").map(String),
      outputShape: String(fd.get("outputShape") || "").trim(),
      acceptanceCriteria: [0,1,2].map((i) => String(fd.get(`acceptance-${i}`) || "").trim()),
      humanResponsibility: String(fd.get("humanResponsibility") || "").trim()
    };
  }

  function persistTaskFields(markDirty) {
    if (!document.getElementById("task-card-form")) return;
    const fields = collectTaskFields();
    S.update((state) => {
      const artifact = taskArtifact(state, true);
      artifact.fields = fields;
      artifact.updatedAt = new Date().toISOString();
      if (markDirty && artifact.status === "ready_to_save") artifact.status = "draft";
      if (artifact.status !== "passed") state.drafts[artifact.id] = artifact;
    });
  }

  function bindFirstTask() {
    const form = document.getElementById("task-card-form");
    form?.addEventListener("change", () => persistTaskFields(true));
    form?.addEventListener("input", () => persistTaskFields(true));
    document.getElementById("fill-example")?.addEventListener("click", () => {
      document.getElementById("goal-audience").value = "团队负责人";
      document.getElementById("goal-use").value = "判断是否用两周时间试行 AI 辅助每周例会纪要，并确定人工审核边界。";
      document.querySelectorAll('input[name="materials"]').forEach((input, index) => { input.checked = index < 4; });
      document.getElementById("output-shape").value = "一页内部研究简报，包含结论、三类证据、风险和两周试行建议。";
      ["包含 3 条主要结论，每条标注材料来源。", "分别列出效率、准确性和风险证据。", "一页内明确给出试行建议与人工检查点。"].forEach((value, index) => { form.querySelector(`[name="acceptance-${index}"]`).value = value; });
      document.getElementById("human-responsibility").value = "负责人核验工具说法和敏感内容，并决定是否发布与启动试行。";
      persistTaskFields(true);
    });
    document.getElementById("check-task-card")?.addEventListener("click", () => {
      const fields = collectTaskFields();
      const results = V.validateTaskCard(fields);
      const passed = V.allPassed(results);
      S.update((state) => {
        const artifact = taskArtifact(state, true);
        artifact.fields = fields;
        artifact.criterionResults = results;
        artifact.feedbackRecords.push({ checkedAt: new Date().toISOString(), results, kinds: ["deterministic", "bounded_case", "human_verification"] });
        artifact.status = passed ? "ready_to_save" : "needs_revision";
        state.drafts[artifact.id] = artifact;
        state.milestones.prompt.status = passed ? "ready_to_save" : "in_progress";
        state.milestones.prompt.passedCriteria = results.filter((item) => item.pass).length;
      });
      renderFirstTask(true);
    });
    document.getElementById("save-artifact")?.addEventListener("click", () => {
      S.update((state) => {
        const artifact = taskArtifact(state, true);
        if (!V.allPassed(artifact.criterionResults || [])) return;
        artifact.status = "passed";
        artifact.updatedAt = new Date().toISOString();
        state.artifacts[artifact.id] = artifact;
        delete state.drafts[artifact.id];
        state.currentStage = "context";
        state.currentUnitId = "learn.context.material-choice";
        state.nextRecommended = "learn.context.material-choice";
        state.milestones.prompt = { status: "completed", artifactId: artifact.id, passedCriteria: 6, requiredCriteria: 6 };
      });
      renderFirstTask(false);
    });
  }

  function renderEvolution() {
    const state = S.load();
    const reflection = state.reflections.evolution || "";
    app.innerHTML = C.regularShell("learn", `
      <main id="main-content" class="container" data-route="evolution" data-interaction="evolution-ladder">
        <header class="page-heading"><span class="eyebrow">同一任务 · 六层控制</span><h1>Prompt 不是终点：看一份简报怎样长成受控系统</h1><p>逐层展开，回答“上一层哪里会失败、这一层新增了什么控制”。</p></header>
        <ol class="ladder">${D.stages.map((stage, index) => `<li class="ladder-item"><button class="ladder-button" aria-expanded="${index === 0 ? "true" : "false"}" aria-controls="stage-detail-${stage.id}" data-ladder="${stage.id}"><span class="ladder-number">${index + 1}</span><span class="ladder-copy"><strong>${C.escapeHtml(stage.title)}</strong><small>${C.escapeHtml(stage.short)}</small></span><span aria-hidden="true">＋</span></button><div class="ladder-detail" id="stage-detail-${stage.id}" ${index === 0 ? "" : "hidden"}><div class="control-grid"><div><strong>上一层会失败</strong><span>${C.escapeHtml(stage.failure)}</span></div><div><strong>本层新增控制</strong><span>${C.escapeHtml(stage.control)}</span></div><div><strong>形成作品</strong><span>${C.escapeHtml(stage.artifact)}</span></div></div></div></li>`).join("")}</ol>
        <section class="card"><label for="evolution-reflection"><strong>用自己的话说：Harness 比长 Prompt 多了什么？</strong></label><textarea id="evolution-reflection">${C.escapeHtml(reflection)}</textarea><p class="field-help">这不是标准答案评分；保存的是你的阶段反思。</p><div class="form-actions"><a class="text-link" href="#/home">稍后再说</a><button class="btn-primary" data-primary-cta id="save-reflection">保存这条判断</button></div></section>
        
      </main>`);
    document.querySelectorAll("[data-ladder]").forEach((button) => button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      document.querySelectorAll("[data-ladder]").forEach((other) => { other.setAttribute("aria-expanded", "false"); document.getElementById(other.getAttribute("aria-controls")).hidden = true; });
      if (!expanded) { button.setAttribute("aria-expanded", "true"); document.getElementById(button.getAttribute("aria-controls")).hidden = false; }
    }));
    document.getElementById("save-reflection").addEventListener("click", () => {
      S.update((next) => { next.reflections.evolution = document.getElementById("evolution-reflection").value.trim(); });
      document.getElementById("save-reflection").textContent = "已保存判断";
    });
    bindCommon();
  }

  function renderContext(focusFeedback) {
    const state = S.load();
    const existing = state.drafts["artifact-context-template-v1"] || state.artifacts["artifact-context-template-v1"] || { selectedMaterials: [], exclusionReasons: {}, criterionResults: [], status: "draft" };
    const checked = existing.criterionResults && existing.criterionResults.length;
    const current = V.validateContext(existing.selectedMaterials || [], existing.exclusionReasons || {});
    app.innerHTML = C.regularShell("learn", `
      <main id="main-content" class="wide-container" data-route="context" data-interaction="context-budgeter">
        <div class="learning-layout">
          <aside class="learning-track">${C.stageSpine("context", true)}</aside>
          <section class="learning-main">
            <header class="page-heading"><span class="eyebrow">Context · 使用上一阶段任务卡</span><h1>材料不是越多越好：用 650 单位支持当前判断</h1><p>选择、版本、来源与排除理由共同构成上下文材料包。</p></header>
            ${taskArtifact(state, false) ? '<section class="notice notice-info"><strong>已复用上一作品</strong><span>目标：为负责人判断是否试行 AI 会议纪要；无需重复录入。</span></section>' : '<section class="notice notice-warning"><strong>缺少上游作品</strong><span>仍可体验预算器，但不会授予核心升级。</span></section>'}
            <section class="card mechanism"><h2>最小机制</h2><p>上下文是当前步骤需要的有限工作集。高信号材料必须支持一个具体判断；过期、重复与无关材料会挤占预算。</p></section>
            <form id="context-form" class="card" novalidate>
              <div class="budget-summary" id="budget-summary"><span>上下文预算</span><strong><span id="budget-used">${current.used}</span> / ${D.budget} 单位</strong><div class="budget-meter ${current.used > D.budget ? "over" : ""}" id="budget-meter" style="--budget:${Math.min(100, current.used / D.budget * 100)}%"><span></span></div><small id="budget-status" role="status" aria-live="polite">剩余 ${current.remaining} 单位</small></div>
              <fieldset id="context-materials"><legend>选择进入当前上下文的材料</legend><div class="material-list">${D.materials.map((item) => `<label class="material-card"><input type="checkbox" name="context-material" value="${item.id}" ${existing.selectedMaterials.includes(item.id) ? "checked" : ""}><span><h3>${C.escapeHtml(item.title)}</h3><p>${C.escapeHtml(item.note)}</p><span class="feedback-kind">${C.escapeHtml(item.signal)}</span></span><small>${item.units} 单位 · ${C.escapeHtml(item.version)}</small></label>`).join("")}</div></fieldset>
              <div class="field exclusion-box" id="exclusion-reason"><label for="exclude-reason">记录至少一项排除理由</label><textarea id="exclude-reason" placeholder="例如：meeting-flow-v1 已被 v2 替代，避免版本冲突。">${C.escapeHtml(existing.exclusionReasons.general || "")}</textarea></div>
              <div class="form-actions"><a class="text-link" href="#/learn/unit/evolution">先看演化阶梯</a><button class="btn-primary" data-primary-cta id="check-context">检查并保存材料选择</button></div>
            </form>
            ${checked ? C.feedbackPanel(existing.criterionResults) : ""}
          </section>
          <aside class="learning-side">${C.artifactSummary(state.artifacts["artifact-task-card-v1"])}</aside>
        </div>
      </main>`);
    bindContext(); bindCommon();
    if (focusFeedback) requestAnimationFrame(() => document.getElementById("feedback-summary")?.focus());
  }

  function collectContext() {
    return { selected: [...document.querySelectorAll('input[name="context-material"]:checked')].map((input) => input.value), reasons: { general: document.getElementById("exclude-reason").value.trim() } };
  }

  function bindContext() {
    document.querySelectorAll('input[name="context-material"]').forEach((input) => input.addEventListener("change", () => {
      const values = collectContext(); const result = V.validateContext(values.selected, values.reasons);
      document.getElementById("budget-used").textContent = result.used;
      document.getElementById("budget-status").textContent = result.remaining >= 0 ? `剩余 ${result.remaining} 单位` : `超出 ${Math.abs(result.remaining)} 单位`;
      const meter = document.getElementById("budget-meter"); meter.style.setProperty("--budget", `${Math.min(100, result.used / D.budget * 100)}%`); meter.classList.toggle("over", result.used > D.budget);
    }));
    document.getElementById("check-context")?.addEventListener("click", () => {
      const values = collectContext(); const validation = V.validateContext(values.selected, values.reasons); const passed = V.allPassed(validation.results);
      S.update((state) => { state.drafts["artifact-context-template-v1"] = { id: "artifact-context-template-v1", title: "上下文材料包", version: 1, stage: "context", selectedMaterials: values.selected, exclusionReasons: values.reasons, budget: validation.used, criterionResults: validation.results, status: passed ? "passed" : "needs_revision", nextUse: "工作流设计" }; state.milestones.context = { status: passed ? "completed" : "in_progress", artifactId: "artifact-context-template-v1", passedCriteria: validation.results.filter((item) => item.pass).length, requiredCriteria: validation.results.length }; if (passed) { state.artifacts["artifact-context-template-v1"] = state.drafts["artifact-context-template-v1"]; state.currentStage = "workflow"; state.currentUnitId = "learn.workflow.state-gates"; state.nextRecommended = "learn.workflow.state-gates"; } });
      renderContext(true);
    });
  }

  const scenarios = {
    missing: { title: "关键材料缺失", observation: "负责人决策标准不在材料包中。", actions: [{ id: "ask", label: "请求人工补充材料", outcome: "waiting_human", note: "状态更新为等待人工，保存恢复点。", good: true }, { id: "guess", label: "根据常识猜测标准", outcome: "failed", note: "信息不足时硬猜，无法验证。", good: false }, { id: "retry", label: "不改变策略，重新生成", outcome: "limit_reached", note: "重复动作没有新信息，会触发重试上限。", good: false }] },
    conflict: { title: "来源冲突", observation: "会议流程 v1 与 v2 对发布步骤描述不同。", actions: [{ id: "compare", label: "比较版本并标记当前来源", outcome: "succeeded", note: "状态更新：采用 v2，冲突进入 Trace。", good: true }, { id: "merge", label: "把两版内容直接合并", outcome: "failed", note: "混用版本让结果不可追溯。", good: false }, { id: "retry", label: "重复读取同一材料", outcome: "limit_reached", note: "没有新策略，停止循环。", good: false }] },
    eval: { title: "验收不通过", observation: "简报没有为结论标注材料来源。", actions: [{ id: "revise", label: "按失败项补来源并重检", outcome: "succeeded", note: "策略改变，重新通过固定验收。", good: true }, { id: "retry", label: "原样重新生成", outcome: "limit_reached", note: "重试没有改变 Prompt 或上下文。", good: false }, { id: "publish", label: "忽略失败直接发送", outcome: "failed", note: "越过人工门，运行失败关闭。", good: false }] }
  };

  function renderAgent(selectedScenario, lastRun) {
    const state = S.load(); const key = selectedScenario || "missing"; const scenario = scenarios[key];
    app.innerHTML = C.regularShell("learn", `<main id="main-content" class="wide-container" data-route="agent" data-interaction="agent-loop-simulator"><div class="learning-layout"><aside class="learning-track">${C.stageSpine("agent", true)}</aside><section class="learning-main"><header class="page-heading"><span class="eyebrow">Agent Loop · 路径不确定才使用</span><h1>每轮都要改变状态，否则重试只是原地打转</h1><p>观察 → 选择行动 → 接收结果 → 更新状态 → 成功、等待人工或失败停止。</p></header><section class="card simulator"><div class="scenario-tabs" role="group" aria-label="固定场景">${Object.entries(scenarios).map(([id, item]) => `<button type="button" data-scenario="${id}" aria-pressed="${id === key}">${C.escapeHtml(item.title)}</button>`).join("")}</div><div class="notice notice-info"><strong>当前观察</strong><span>${C.escapeHtml(scenario.observation)}</span></div><form id="agent-form"><fieldset><legend>选择下一步行动</legend><div class="action-options">${scenario.actions.map((action) => `<label class="radio-card"><input type="radio" name="agent-action" value="${action.id}"><span><strong>${C.escapeHtml(action.label)}</strong><small>选择后查看状态怎样变化</small></span></label>`).join("")}</div></fieldset><div class="form-actions"><a class="text-link" href="#/learn/unit/evolution">查看为什么需要 Agent</a><button class="btn-primary" data-primary-cta id="run-agent">运行这一步</button></div></form></section>${lastRun ? `<section class="card" id="agent-result" tabindex="-1"><span class="eyebrow">运行轨迹</span><h2>${C.escapeHtml(lastRun.action.outcome)}</h2><ol class="trace"><li><strong>观察</strong><span>${C.escapeHtml(scenario.observation)}</span></li><li><strong>行动</strong><span>${C.escapeHtml(lastRun.action.label)}</span></li><li><strong>状态更新</strong><span>${C.escapeHtml(lastRun.action.note)}</span></li><li><strong>停止原因</strong><span>${lastRun.action.good ? "已获得可验证的新状态" : "失败关闭或达到重试上限"}</span></li></ol><p>${C.feedbackBadge(lastRun.action.good ? "bounded_case" : "deterministic")} 这只判断固定场景的状态转换；真实任务需人工确认恢复点。</p></section>` : ""}</section><aside class="learning-side">${C.artifactSummary(state.artifacts["artifact-agent-loop-v1"] || state.drafts["artifact-agent-loop-v1"])}</aside></div></main>`);
    document.querySelectorAll("[data-scenario]").forEach((button) => button.addEventListener("click", () => renderAgent(button.dataset.scenario, null)));
    document.getElementById("run-agent").addEventListener("click", (event) => { event.preventDefault(); const choice = document.querySelector('input[name="agent-action"]:checked'); if (!choice) { document.querySelector('fieldset legend').focus?.(); return; } const action = scenario.actions.find((item) => item.id === choice.value); const artifact = { id: "artifact-agent-loop-v1", title: "智能体运行卡", version: 1, stage: "agent", scenario: key, observation: scenario.observation, action: action.id, outcome: action.outcome, retryLimit: 2, recoveryPoint: "选择行动前", trace: ["observe", action.id, action.outcome], status: action.good ? "passed" : "needs_revision", nextUse: "Harness 权限与 Trace" }; S.update((next) => { next.drafts[artifact.id] = artifact; next.milestones.agent = { status: action.good ? "completed" : "in_progress", artifactId: artifact.id, passedCriteria: action.good ? 4 : 2, requiredCriteria: 4 }; if (action.good) { next.artifacts[artifact.id] = artifact; next.currentStage = "harness"; next.currentUnitId = "learn.harness.permissions"; next.nextRecommended = "learn.harness.permissions"; } }); renderAgent(key, { action }); requestAnimationFrame(() => document.getElementById("agent-result")?.focus()); });
    bindCommon();
  }

  const permissionRows = [
    ["localRead", "读取本地材料", "可逆、固定教学资料"], ["externalQuery", "外部查询", "信息可能变化并带来数据风险"], ["draftWrite", "写入隔离草稿", "可回滚，但会改变文件"], ["sendResult", "发送结果", "不可逆，代表对外发布"]
  ];

  function renderHarness(focusFeedback) {
    const state = S.load(); const artifact = state.drafts["artifact-minimum-harness-v1"] || state.artifacts["artifact-minimum-harness-v1"] || { permissions: { localRead: "allow", externalQuery: "ask", draftWrite: "allow", sendResult: "ask" }, criterionResults: [] }; const values = artifact.permissions;
    app.innerHTML = C.regularShell("learn", `<main id="main-content" class="wide-container" data-route="harness" data-interaction="permission-matrix"><div class="learning-layout"><aside class="learning-track">${C.stageSpine("harness", true)}</aside><section class="learning-main"><header class="page-heading"><span class="eyebrow">Harness · 最小授权</span><h1>能运行不等于可放手：为每项动作选 allow / ask / deny</h1><p>不可逆动作需要人工门；敏感信息和外部查询不能因为“方便”而默认放行。</p></header><section class="card mechanism"><h2>三种权限</h2><p><strong>allow</strong> 可直接执行；<strong>ask</strong> 每次请求人工确认；<strong>deny</strong> 禁止执行。选择要与对象、动作和可逆性一起判断。</p></section><form id="permission-form" class="card"><table class="permission-table"><caption class="sr-only">研究简报 Agent 权限矩阵</caption><thead><tr><th>动作与风险</th><th>权限选择</th></tr></thead><tbody>${permissionRows.map(([id, label, risk]) => `<tr><th scope="row"><strong>${label}</strong><span class="muted">${risk}</span></th><td><fieldset id="perm-${id}"><legend class="sr-only">${label}权限</legend><div class="permission-row-options">${["allow","ask","deny"].map((value) => `<label><input type="radio" name="${id}" value="${value}" ${values[id] === value ? "checked" : ""}>${value}</label>`).join("")}</div></fieldset></td></tr>`).join("")}</tbody></table><div class="form-actions"><a class="text-link" href="#/learn/unit/evolution">返回演化阶梯</a><button class="btn-primary" data-primary-cta id="check-permissions">检查并保存权限</button></div></form>${artifact.criterionResults.length ? C.feedbackPanel(artifact.criterionResults) : ""}</section><aside class="learning-side">${C.artifactSummary(artifact.id ? artifact : null)}</aside></div></main>`);
    document.getElementById("check-permissions").addEventListener("click", (event) => { event.preventDefault(); const fd = new FormData(document.getElementById("permission-form")); const permissions = Object.fromEntries(permissionRows.map(([id]) => [id, String(fd.get(id) || "")])); const results = V.validatePermissions(permissions); const passed = V.allPassed(results); S.update((next) => { const previous = next.artifacts["artifact-minimum-harness-v1"] || next.drafts["artifact-minimum-harness-v1"] || {}; const out = { ...previous, id: "artifact-minimum-harness-v1", title: "最小运行护栏系统", version: 1, stage: "harness", permissions, criterionResults: results, status: passed ? "passed" : "needs_revision", nextUse: "Eval 与能力资产封装" }; next.drafts[out.id] = out; next.milestones.harness = { status: passed && out.evalCases ? "completed" : "in_progress", artifactId: out.id, passedCriteria: results.filter((item) => item.pass).length, requiredCriteria: 6 }; if (passed) next.artifacts[out.id] = out; }); renderHarness(true); });
    bindCommon(); if (focusFeedback) requestAnimationFrame(() => document.getElementById("feedback-summary")?.focus());
  }

  function renderWorkflow(focusFeedback) {
    const state = S.load();
    const existing = state.drafts["artifact-workflow-v1"] || state.artifacts["artifact-workflow-v1"] || { gate: "", exception: "", observable: false, hasBoundaries: false, criterionResults: [] };
    app.innerHTML = C.regularShell("learn", `<main id="main-content" class="wide-container" data-route="workflow" data-interaction="workflow-builder"><div class="learning-layout"><aside class="learning-track">${C.stageSpine("workflow", true)}</aside><section class="learning-main"><header class="page-heading"><span class="eyebrow">Workflow · 固定路径先显式化</span><h1>步骤不是状态：让失败停在可恢复的位置</h1><p>资料研究简报按 received → extracting → comparing → drafting → verifying → ready_for_review → done 推进。</p></header><section class="card mechanism"><h2>每个状态必须留下产物</h2><p>状态描述“系统现在处于什么条件”，步骤描述“要执行什么动作”。检查点保存可恢复证据；人工门位于不可逆动作之前。</p></section><form id="workflow-form" class="card"><fieldset><legend>补齐这条工作流的控制</legend><label class="check-card" id="workflow-boundaries"><input type="checkbox" name="boundaries" ${existing.hasBoundaries ? "checked" : ""}><span><strong>明确开始与结束</strong><small>received 是入口，done 只在人工确认后到达。</small></span></label><div class="field" id="workflow-gate"><label for="human-gate">人工门放在哪里？</label><select id="human-gate" name="gate"><option value="">请选择</option><option value="before_send" ${existing.gate === "before_send" ? "selected" : ""}>ready_for_review → 发送之前</option><option value="after_done" ${existing.gate === "after_done" ? "selected" : ""}>done 之后</option></select></div><div class="field" id="workflow-exception"><label for="exception-state">来源冲突时进入哪个状态？</label><select id="exception-state" name="exception"><option value="">请选择</option><option value="source_conflict" ${existing.exception === "source_conflict" ? "selected" : ""}>source_conflict，等待比较或人工判断</option><option value="done" ${existing.exception === "done" ? "selected" : ""}>直接 done</option></select></div><label class="check-card" id="workflow-output"><input type="checkbox" name="observable" ${existing.observable ? "checked" : ""}><span><strong>每个状态都有可观察产物</strong><small>例如提取表、比较表、草稿、核查记录，而不是只写“处理中”。</small></span></label></fieldset><div class="form-actions"><a class="text-link" href="#/learn/stage/context">返回材料包</a><button class="btn-primary" data-primary-cta id="check-workflow">检查并保存工作流</button></div></form>${existing.criterionResults.length ? C.feedbackPanel(existing.criterionResults) : ""}</section><aside class="learning-side">${C.artifactSummary(state.artifacts["artifact-context-template-v1"])}</aside></div></main>`);
    document.getElementById("check-workflow").addEventListener("click", (event) => {
      event.preventDefault(); const fd = new FormData(document.getElementById("workflow-form"));
      const fields = { hasBoundaries: fd.get("boundaries") === "on", gate: String(fd.get("gate") || ""), exception: String(fd.get("exception") || ""), observable: fd.get("observable") === "on" };
      const results = [
        { id: "workflow-boundaries", pass: fields.hasBoundaries, message: "开始与结束已明确", fix: "勾选 received 入口与人工确认后的 done。", kind: "deterministic", field: "workflow-boundaries", required: true },
        { id: "workflow-gate", pass: fields.gate === "before_send", message: "人工门位于不可逆动作之前", fix: "把人工门放到 ready_for_review → 发送之前。", kind: "bounded_case", field: "workflow-gate", required: true },
        { id: "workflow-exception", pass: fields.exception === "source_conflict", message: "来源冲突有独立失败状态", fix: "进入 source_conflict，比较版本或等待人工，不要直接完成。", kind: "bounded_case", field: "workflow-exception", required: true },
        { id: "workflow-output", pass: fields.observable, message: "每个状态都有可观察产物", fix: "为提取、比较、草拟和核查分别留下产物。", kind: "human_verification", field: "workflow-output", required: true }
      ];
      const passed = results.every((item) => item.pass);
      S.update((next) => { const out = { id: "artifact-workflow-v1", title: "资料研究简报工作流", version: 1, stage: "workflow", ...fields, states: ["received", "extracting", "comparing", "drafting", "verifying", "ready_for_review", "done"], criterionResults: results, status: passed ? "passed" : "needs_revision", nextUse: "Agent 动态分支" }; next.drafts[out.id] = out; next.milestones.workflow = { status: passed ? "completed" : "in_progress", artifactId: out.id, passedCriteria: results.filter((item) => item.pass).length, requiredCriteria: 4 }; if (passed) { next.artifacts[out.id] = out; next.currentStage = "agent"; next.currentUnitId = "learn.agent.simulation"; next.nextRecommended = "learn.agent.simulation"; } });
      renderWorkflow(true);
    });
    bindCommon(); if (focusFeedback) requestAnimationFrame(() => document.getElementById("feedback-summary")?.focus());
  }

  function renderEval(focusFeedback) {
    const state = S.load(); const harness = state.drafts["artifact-minimum-harness-v1"] || state.artifacts["artifact-minimum-harness-v1"] || {};
    const prior = harness.evalCases || { fact: "", decision: "", risk: "", evidence: "", trajectorySafe: "" };
    const scoreRow = (id, label, value) => `<fieldset id="eval-${id}"><legend>${label}</legend><div class="permission-row-options">${[0,1,2].map((score) => `<label><input type="radio" name="${id}" value="${score}" ${String(value) === String(score) ? "checked" : ""}>${score}</label>`).join("")}</div></fieldset>`;
    app.innerHTML = C.regularShell("learn", `<main id="main-content" class="wide-container" data-route="eval" data-interaction="eval-scorer"><div class="learning-layout"><aside class="learning-track">${C.stageSpine("harness", true)}</aside><section class="learning-main"><header class="page-heading"><span class="eyebrow">Harness · EvalScorer</span><h1>结果好看但轨迹越权，整体仍不能通过</h1><p>0=缺失或错误，1=部分满足，2=有明确证据。每个分数都要能指回材料或 Trace。</p></header><form id="eval-form" class="card">${scoreRow("fact", "事实与来源对应", prior.fact)}${scoreRow("decision", "结论服务于负责人决策", prior.decision)}${scoreRow("risk", "风险与未知项披露", prior.risk)}<div class="field" id="eval-evidence"><label for="eval-evidence-text">写一条评分证据</label><textarea id="eval-evidence-text" name="evidence" placeholder="例如：3 条结论均标注材料 ID；待核查工具说法未进入结论。">${C.escapeHtml(prior.evidence || "")}</textarea></div><fieldset id="eval-trajectory"><legend>Trace 显示发送动作未经人工确认，这个样例能否整体通过？</legend><label class="radio-card"><input type="radio" name="trajectorySafe" value="no" ${prior.trajectorySafe === "no" ? "checked" : ""}>不能；轨迹级越权是阻断项</label><label class="radio-card"><input type="radio" name="trajectorySafe" value="yes" ${prior.trajectorySafe === "yes" ? "checked" : ""}>能；只要结果正确</label></fieldset><div class="form-actions"><a class="text-link" href="#/learn/stage/harness">返回权限矩阵</a><button class="btn-primary" data-primary-cta id="check-eval">检查并保存 Eval</button></div></form>${harness.evalResults?.length ? C.feedbackPanel(harness.evalResults) : ""}</section><aside class="learning-side">${C.artifactSummary(harness.id ? harness : null)}</aside></div></main>`);
    document.getElementById("check-eval").addEventListener("click", (event) => {
      event.preventDefault(); const fd = new FormData(document.getElementById("eval-form"));
      const values = { fact: String(fd.get("fact") || ""), decision: String(fd.get("decision") || ""), risk: String(fd.get("risk") || ""), evidence: String(fd.get("evidence") || "").trim(), trajectorySafe: String(fd.get("trajectorySafe") || "") };
      const results = [
        { id: "eval-fact", pass: Number(values.fact) >= 2, message: "关键事实有来源证据", fix: "事实与来源对应必须达到 2。", kind: "bounded_case", field: "eval-fact", required: true },
        { id: "eval-decision", pass: Number(values.decision) >= 1, message: "结论与决策相关", fix: "至少说明一条结论怎样支持负责人的决定。", kind: "human_verification", field: "eval-decision", required: true },
        { id: "eval-risk", pass: Number(values.risk) >= 1, message: "风险与未知项已披露", fix: "风险项至少达到 1，未知事实不能伪装成结论。", kind: "bounded_case", field: "eval-risk", required: true },
        { id: "eval-evidence", pass: values.evidence.length >= 12, message: "评分有可回溯证据", fix: "写明材料 ID、输出位置或 Trace 事件。", kind: "deterministic", field: "eval-evidence", required: true },
        { id: "eval-trajectory", pass: values.trajectorySafe === "no", message: "轨迹越权会阻断整体通过", fix: "选择不能通过；结果正确不能抵消未经授权的发送。", kind: "deterministic", field: "eval-trajectory", required: true }
      ];
      const passed = results.every((item) => item.pass); const permissionPassed = (harness.criterionResults || []).every((item) => item.pass);
      S.update((next) => { const previous = next.artifacts["artifact-minimum-harness-v1"] || next.drafts["artifact-minimum-harness-v1"] || {}; const out = { ...previous, id: "artifact-minimum-harness-v1", title: "最小运行护栏系统", version: 1, stage: "harness", evalCases: values, evalResults: results, status: passed && permissionPassed ? "passed" : "needs_revision", nextUse: "能力资产封装" }; next.drafts[out.id] = out; next.milestones.harness = { status: out.status === "passed" ? "completed" : "in_progress", artifactId: out.id, passedCriteria: results.filter((item) => item.pass).length + (permissionPassed ? 1 : 0), requiredCriteria: 6 }; if (out.status === "passed") { next.artifacts[out.id] = out; next.currentStage = "asset"; next.currentUnitId = "learn.asset.package"; next.nextRecommended = "learn.asset.package"; } });
      renderEval(true);
    });
    bindCommon(); if (focusFeedback) requestAnimationFrame(() => document.getElementById("feedback-summary")?.focus());
  }

  function renderAsset(focusFeedback) {
    const state = S.load(); const existing = state.drafts["artifact-capability-package-v1"] || state.artifacts["artifact-capability-package-v1"] || { fields: {}, criterionResults: [] }; const f = existing.fields || {};
    app.innerHTML = C.regularShell("learn", `<main id="main-content" class="wide-container" data-route="asset" data-interaction="capability-package"><div class="learning-layout"><aside class="learning-track">${C.stageSpine("asset", true)}</aside><section class="learning-main"><header class="page-heading"><span class="eyebrow">Skill / AgentOS · 能力资产</span><h1>别人能接手、能验证、能升级，方法才算资产</h1><p>AgentOS 是本库管理能力资产的教学视角，不是行业统一产品定义。</p></header><form id="asset-form" class="card"><div class="field" id="asset-applicability"><label for="asset-applicability-text">适用与不适用边界</label><textarea id="asset-applicability-text" name="applicability">${C.escapeHtml(f.applicability || "")}</textarea></div><div class="field" id="asset-owner"><label for="asset-owner-text">Owner</label><input id="asset-owner-text" name="owner" value="${C.escapeHtml(f.owner || "")}"></div><div class="field" id="asset-version"><label for="asset-version-text">版本</label><input id="asset-version-text" name="version" value="${C.escapeHtml(f.version || "v1")}"></div><div class="field" id="asset-handoff"><label for="asset-handoff-text">Handoff：下一位执行者最少需要什么</label><textarea id="asset-handoff-text" name="handoff">${C.escapeHtml(f.handoff || "")}</textarea></div><div class="field" id="asset-eval"><label for="asset-eval-text">Eval 基线与失败回流</label><textarea id="asset-eval-text" name="evalBaseline">${C.escapeHtml(f.evalBaseline || "")}</textarea></div><label class="check-card" id="asset-boundary"><input type="checkbox" name="privateBoundary" ${f.privateBoundary ? "checked" : ""}><span><strong>已区分个人私有经验与可共享方法</strong><small>授权私有仓库只保留概念抽象，不公开路径、字段、正文或资产。</small></span></label><div class="form-actions"><a class="text-link" href="#/learn/unit/eval">返回 Eval</a><button class="btn-primary" data-primary-cta id="check-asset">检查并登记能力</button></div></form>${existing.criterionResults.length ? C.feedbackPanel(existing.criterionResults) : ""}</section><aside class="learning-side">${C.artifactSummary(state.artifacts["artifact-minimum-harness-v1"])}</aside></div></main>`);
    document.getElementById("check-asset").addEventListener("click", (event) => { event.preventDefault(); const fd = new FormData(document.getElementById("asset-form")); const fields = { applicability: String(fd.get("applicability") || "").trim(), owner: String(fd.get("owner") || "").trim(), version: String(fd.get("version") || "").trim(), handoff: String(fd.get("handoff") || "").trim(), evalBaseline: String(fd.get("evalBaseline") || "").trim(), privateBoundary: fd.get("privateBoundary") === "on" }; const checks = [["applicability", fields.applicability.length >= 12, "写清适用与不适用边界"], ["owner", fields.owner.length >= 2, "指定维护 owner"], ["version", /^v?\d+/i.test(fields.version), "使用可识别版本号"], ["handoff", fields.handoff.length >= 12, "handoff 足以独立接续"], ["eval", fields.evalBaseline.length >= 12, "记录 Eval 基线与失败回流"], ["boundary", fields.privateBoundary, "区分私有与共享边界"]]; const results = checks.map(([id, pass, message]) => ({ id: `asset-${id}`, pass, message, fix: `补充：${message}。`, kind: id === "boundary" ? "human_verification" : "deterministic", field: `asset-${id}`, required: true })); const passed = results.every((item) => item.pass); S.update((next) => { const out = { id: "artifact-capability-package-v1", title: "资料研究简报能力资产包", version: 1, stage: "asset", fields, criterionResults: results, status: passed ? "passed" : "needs_revision", nextUse: "第二个真实任务与失败复盘" }; next.drafts[out.id] = out; next.milestones.asset = { status: passed ? "completed" : "in_progress", artifactId: out.id, passedCriteria: results.filter((item) => item.pass).length, requiredCriteria: 6 }; if (passed) next.artifacts[out.id] = out; }); renderAsset(true); });
    bindCommon(); if (focusFeedback) requestAnimationFrame(() => document.getElementById("feedback-summary")?.focus());
  }

  function renderDirectory() {
    const articles = window.LEARNING_ARTICLES || [];
    const sequence = coreReadingSequence();
    const state = S.load();
    const recent = latestReading(state);
    const focus = recent || sequence[0];
    const focusIndex = focus ? sequence.findIndex((item) => item.path === focus.path) : 0;
    const focusStage = readingStages.find((stage) => stage.id === focus?.stage) || readingStages[0];
    const guide = articles.filter((item) => item.path.startsWith("00-课程入口/") && !item.path.endsWith("03-第一次AI作品路线.md"));
    const stageSections = readingStages.map((stage, index) => {
      const items = sequence.filter((item) => item.stage === stage.id);
      return `<details class="directory-stage" id="directory-${stage.id}"><summary><span class="directory-number">${index + 1}</span><span class="directory-stage-copy"><span class="eyebrow">${C.escapeHtml(stage.concept)}</span><strong>${C.escapeHtml(stage.title)}</strong><small>${C.escapeHtml(stage.question)} · ${items.length} 篇</small></span></summary><div class="directory-stage-body"><p>${C.escapeHtml(stage.description)}</p>${directoryArticleList(items)}</div></details>`;
    }).join("");
    app.innerHTML = C.regularShell("directory", `<main id="main-content" class="container directory-page" data-route="directory"><header class="page-heading"><span class="eyebrow">学习路线</span><h1>不用研究目录，跟着下一篇读就可以</h1><p>整套知识已经排好顺序。你只需要处理眼前这一篇，后面的内容会在需要时自然出现。</p></header><section class="directory-focus"><div><span class="eyebrow">${recent ? "继续上次阅读" : "第一次来，从这里开始"}</span><h2>${C.escapeHtml(focus ? focus.title : "AI 到底改变了什么")}</h2><p>${C.escapeHtml(focusStage.description)}</p><span class="muted">第 ${focusIndex + 1} 篇 · 约 ${focus ? focus.minutes : 5} 分钟</span></div><a class="btn-primary" data-primary-cta href="${articleHref(focus)}">${recent ? "继续读这一篇" : "开始第一篇"}</a></section><section class="secondary-section" aria-labelledby="six-questions-title"><div class="section-heading-row"><div><h2 id="six-questions-title">整套知识只回答六个问题</h2><p>这些是路标，不是现在要背的目录。</p></div></div>${stageJourney(focusStage.id)}</section><details class="full-directory"><summary><span><strong>我想自己挑选文章</strong><small>展开完整 28 篇目录、导读和补充内容</small></span></summary><div class="full-directory-body"><p class="muted">不确定时不用展开任何阶段，回到上面的推荐阅读即可。</p><div class="directory-stage-list">${stageSections}</div><section class="directory-guide-links"><h2>课程说明与补充内容</h2><div class="guide-links">${guide.map((item) => `<a href="${articleHref(item)}">${C.escapeHtml(item.title)}</a>`).join("")}<a href="#/lab">浏览真实案例</a><a href="#/reference">搜索概念和工具</a></div></section></div></details></main>`);
    bindCommon();
  }

  function directoryArticleList(items) {
    return `<ol class="directory-article-list">${items.map((item, index) => `<li><a href="${articleHref(item)}"><span>${index + 1}</span><span><strong>${C.escapeHtml(item.title)}</strong><small>约 ${item.minutes} 分钟</small></span></a></li>`).join("")}</ol>`;
  }

  function renderLab(result) {
    const labArticles = (window.LEARNING_ARTICLES || []).filter((item) => item.mode === "lab");
    app.innerHTML = C.regularShell("practice", `<main id="main-content" class="container" data-route="lab" data-interaction="lab-decision"><header class="page-heading"><span class="eyebrow">案例与练习 · 完全可选</span><h1>先读案例；想动手时，再做一个小练习</h1><p>这里不会催你交作业，也不会影响主线阅读。你可以只读案例，也可以把自己的任务带进来试一试。</p></header><section class="secondary-section lab-reading-first"><div class="section-heading-row"><div><h2>11 个真实场景案例</h2><p>每篇都说明输入、关键判断、质量门和人工责任。</p></div><a href="#/portfolio">查看已有练习记录</a></div><div class="reference-grid">${articleCards(labArticles)}</div></section><details class="optional-practice" ${result ? "open" : ""}><summary><span><strong>我有一个具体任务，帮我判断从哪里开始</strong><small>可选 · 约 2 分钟</small></span></summary><div class="optional-practice-body"><form id="lab-form"><div class="field"><label for="task-type">任务类型</label><select id="task-type" name="taskType"><option value="research">资料研究简报</option><option value="summary">长文总结</option><option value="meeting">会议纪要</option><option value="ppt">PPT 大纲</option><option value="aigc">AIGC 创作</option><option value="other">其他任务</option></select></div><div class="diagnostic">${[["repeat","是否重复发生？"],["fixed","路径大体固定吗？"],["external","涉及外部工具或发布吗？"]].map(([id,label]) => `<fieldset><legend>${label}</legend><label class="radio-card"><input type="radio" name="${id}" value="yes">是</label><label class="radio-card"><input type="radio" name="${id}" value="no">否</label></fieldset>`).join("")}</div><div class="form-actions"><a class="text-link" href="#/directory">先回去阅读</a><button class="btn-primary" data-primary-cta id="diagnose-task">查看建议</button></div></form>${result ? `<section class="notice notice-success" id="lab-result" tabindex="-1"><strong>${C.escapeHtml(result.title)}</strong><span>${C.escapeHtml(result.body)}</span><small>这只是学习建议，不是必须完成的升级条件。</small></section>` : ""}</div></details></main>`);
    document.getElementById("diagnose-task").addEventListener("click", (event) => { event.preventDefault(); const fd = new FormData(document.getElementById("lab-form")); const fixed = fd.get("fixed") === "yes"; const external = fd.get("external") === "yes"; const next = external ? { title: "先写任务卡，再明确权限与人工门", body: "任务涉及外部工具或发布；先确定目标与验收，再为不可逆动作保留人工确认。" } : fixed ? { title: "先写任务卡，再升级成 Workflow", body: "路径大体固定，不必直接上 Agent；先显式化状态、检查点与失败分支。" } : { title: "先用四格任务卡，不需要立刻使用 Agent", body: "先确认目标、材料、输出与验收；只有下一步依赖环境反馈时，才设计 Agent Loop。" }; renderLab(next); requestAnimationFrame(() => document.getElementById("lab-result")?.focus()); }); bindCommon();
  }

  function renderReference() {
    const articles = window.LEARNING_ARTICLES || [];
    const initial = articles.slice(0, 80);
    app.innerHTML = C.regularShell("reference", `<main id="main-content" class="container" data-route="reference"><header class="page-heading"><span class="eyebrow">知识检索 · 全库搜索</span><h1>遇到不懂的概念，再来这里查</h1><p>可以搜索全部课程、案例和专题。检索是阅读的辅助，不要求你先记住术语。</p></header><div class="search-tools"><label><span class="sr-only">搜索全部知识</span><input type="search" id="reference-search" placeholder="搜索上下文、Workflow、Agent、Harness、RAG"></label><button class="btn-secondary" id="clear-search">清空</button></div><div class="filter-row" role="group" aria-label="内容类型筛选">${[["all","全部"],["learn","课程"],["lab","案例"],["reference","专题"],["portfolio","练习资料"]].map(([id,label]) => `<button class="filter-button" data-mode-filter="${id}" aria-pressed="${id === "all" ? "true" : "false"}">${label}</button>`).join("")}</div><p class="muted" id="search-summary" role="status">显示全部 ${initial.length} 条内容</p><div class="reference-grid" id="reference-results">${articleCards(initial)}</div></main>`);
    let mode = "all";
    const applySearch = () => { const q = document.getElementById("reference-search").value.trim().toLowerCase(); const filtered = articles.filter((item) => (mode === "all" || item.mode === mode) && (!q || `${item.title} ${item.excerpt} ${item.moduleTitle}`.toLowerCase().includes(q))).slice(0, 80); document.getElementById("reference-results").innerHTML = articleCards(filtered); document.getElementById("search-summary").textContent = `找到 ${filtered.length} 条 · ${mode === "all" ? "全部模式" : mode}`; };
    document.getElementById("reference-search").addEventListener("input", applySearch);
    document.getElementById("clear-search").addEventListener("click", () => { document.getElementById("reference-search").value = ""; applySearch(); });
    document.querySelectorAll("[data-mode-filter]").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.modeFilter; document.querySelectorAll("[data-mode-filter]").forEach((item) => item.setAttribute("aria-pressed", String(item === button))); applySearch(); }));
    bindCommon();
  }

  function articleCards(items) {
    const labels = { learn: "课程", lab: "案例", reference: "专题", portfolio: "练习资料" };
    return items.length ? items.map((item) => `<article class="reference-card"><span class="eyebrow">${C.escapeHtml(labels[item.mode] || item.mode)} · ${C.escapeHtml(item.stage || item.moduleTitle)}</span><h2>${C.escapeHtml(item.title)}</h2><p>${C.escapeHtml(item.excerpt)}</p><div class="reference-meta"><span class="feedback-kind">${item.pageType === "core-spine" ? "主线阅读" : "按需阅读"}</span><span class="feedback-kind">约 ${item.minutes} 分钟</span></div><a href="#/read/${encodeURIComponent(item.path)}">打开阅读</a></article>`).join("") : '<section class="notice"><strong>没有找到完全匹配的内容</strong><span>可以清空筛选，或回到学习路线继续阅读。</span><a href="#/directory">查看学习路线</a></section>';
  }

  function markdownHref(href, currentPath) {
    const value = String(href || "").trim();
    if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value)) return value;
    if (value.startsWith("#/")) return value;

    const target = value.split("#")[0];
    if (!currentPath || !target.endsWith(".md")) return "#/reference";

    const parts = currentPath.split("/");
    parts.pop();
    for (const segment of target.split("/")) {
      if (!segment || segment === ".") continue;
      if (segment === "..") parts.pop();
      else parts.push(segment);
    }
    return `#/read/${encodeURIComponent(parts.join("/"))}`;
  }

  function renderMarkdown(markdown, currentPath) {
    const source = String(markdown || "").replace(/<!-- PRACTICE:START -->[\s\S]*?<!-- PRACTICE:END -->/g, (block) => block.replace(/<!--[\s\S]*?-->/g, ""));
    const lines = source.split(/\r?\n/); const out = []; let inCode = false; let code = []; let list = null; let table = [];
    const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
    const inline = (value) => C.escapeHtml(value).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)]\(([^)]+)\)/g, (m, label, href) => `<a href="${C.escapeHtml(markdownHref(href, currentPath))}">${label}</a>`);
    const splitTableRow = (value) => {
      const clean = value.trim().replace(/^\|/, "").replace(/\|$/, "");
      const cells = []; let cell = ""; let escaped = false; let inInlineCode = false;
      for (const char of clean) {
        if (escaped) { cell += char; escaped = false; continue; }
        if (char === "\\") { escaped = true; continue; }
        if (char === "`") { inInlineCode = !inInlineCode; cell += char; continue; }
        if (char === "|" && !inInlineCode) { cells.push(cell.trim()); cell = ""; continue; }
        cell += char;
      }
      if (escaped) cell += "\\";
      cells.push(cell.trim());
      return cells;
    };
    const flushTable = () => {
      if (!table.length) return;
      const rows = table.map(splitTableRow);
      const header = rows[0] || [];
      const separators = rows[1] || [];
      const valid = header.length > 0 && rows.length >= 2 && separators.length === header.length && separators.every((cell) => /^:?-{3,}:?$/.test(cell));
      if (!valid) {
        out.push(...table.map((line) => `<pre class="table-fallback">${C.escapeHtml(line)}</pre>`));
        table = [];
        return;
      }
      const alignments = separators.map((cell) => cell.startsWith(":") && cell.endsWith(":") ? "center" : cell.endsWith(":") ? "right" : "left");
      const renderCells = (cells, tag) => header.map((_, index) => `<${tag} class="table-align-${alignments[index]}">${inline(cells[index] || "")}</${tag}>`).join("");
      const bodyRows = rows.slice(2).map((row) => `<tr>${renderCells(row, "td")}</tr>`).join("");
      out.push(`<div class="table-scroll" role="region" aria-label="文章数据表"><table><thead><tr>${renderCells(header, "th")}</tr></thead><tbody>${bodyRows}</tbody></table></div>`);
      table = [];
    };
    for (const raw of lines) {
      const line = raw.trimEnd();
      if (/^(```|~~~)/.test(line)) { closeList(); flushTable(); if (inCode) { out.push(`<pre><code>${C.escapeHtml(code.join("\n"))}</code></pre>`); code = []; } inCode = !inCode; continue; }
      if (inCode) { code.push(raw); continue; }
      if (!line.trim()) { closeList(); flushTable(); continue; }
      if (/^\s*\|/.test(line)) { closeList(); table.push(line); continue; }
      flushTable();
      const image = line.match(/^!\[([^\]]*)]\(([^)]+)\)\s*$/); if (image) { closeList(); const caption = image[1].trim(); out.push(`<figure class="article-figure"><img src="${C.escapeHtml(image[2])}" alt="${C.escapeHtml(caption)}" loading="lazy">${caption ? `<figcaption>${C.escapeHtml(caption)}</figcaption>` : ""}</figure>`); continue; }
      const h = line.match(/^(#{1,4})\s+(.+)/); if (h) { closeList(); const level = Math.min(4, h[1].length + 1); out.push(`<h${level}>${inline(h[2])}</h${level}>`); continue; }
      const ul = line.match(/^[-*]\s+(.+)/); if (ul) { if (list !== "ul") { closeList(); list = "ul"; out.push("<ul>"); } out.push(`<li>${inline(ul[1])}</li>`); continue; }
      const ol = line.match(/^\d+\.\s+(.+)/); if (ol) { if (list !== "ol") { closeList(); list = "ol"; out.push("<ol>"); } out.push(`<li>${inline(ol[1])}</li>`); continue; }
      if (/^>\s?/.test(line)) { closeList(); out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`); continue; }
      closeList(); out.push(`<p>${inline(line)}</p>`);
    }
    closeList(); flushTable(); return out.join("");
  }

  function splitArticleBody(markdown) {
    const source = String(markdown || "");
    const match = source.match(/<!-- PRACTICE:START -->([\s\S]*?)<!-- PRACTICE:END -->/);
    const reading = (match ? source.replace(match[0], "") : source)
      .replace(/^\s*#\s+[^\n]+\n+/, "")
      .replace(/^\s*##\s+深入理解与原有知识\s*\n+/, "");
    return {
      reading,
      practice: match ? match[1].replace(/<!--[\s\S]*?-->/g, "").trim() : ""
    };
  }

  function rememberReading(article) {
    S.update((state) => {
      const entries = Array.isArray(state.readingHistory) ? state.readingHistory : [];
      const normalized = entries.map((item) => typeof item === "string" ? { path: item, visitedAt: null } : item).filter((item) => item && item.path !== article.path);
      normalized.push({ path: article.path, visitedAt: new Date().toISOString() });
      state.readingHistory = normalized.slice(-60);
    });
  }

  function renderReader(encodedPath) {
    let articlePath = ""; try { articlePath = decodeURIComponent(encodedPath || ""); } catch (_) { articlePath = encodedPath || ""; }
    const articles = window.LEARNING_ARTICLES || []; const article = articles.find((item) => item.path === articlePath);
    if (!article) { renderUnknown(); return; }
    rememberReading(article);
    const parts = splitArticleBody(article.body);
    const sequence = coreReadingSequence();
    const readingIndex = sequence.findIndex((item) => item.path === article.path);
    const previous = readingIndex > 0 ? sequence[readingIndex - 1] : null;
    const next = readingIndex >= 0 && readingIndex < sequence.length - 1 ? sequence[readingIndex + 1] : null;
    const backHref = article.pageType === "core-spine" ? "#/directory" : article.mode === "lab" ? "#/lab" : "#/reference";
    const active = article.mode === "reference" ? "reference" : article.mode === "lab" || article.mode === "portfolio" ? "practice" : "directory";
    const currentStage = readingStages.find((stage) => stage.id === article.stage);
    const currentStageItems = currentStage ? sequence.filter((item) => item.stage === currentStage.id) : [];
    const currentStagePosition = currentStage ? currentStageItems.findIndex((item) => item.path === article.path) + 1 : 0;
    const readerKicker = readingIndex >= 0 ? `第 ${readingIndex + 1} 篇 · ${currentStage ? currentStage.title : "主线阅读"}` : "按需补充阅读";
    const practice = parts.practice ? `<details class="reading-practice"><summary><span><strong>想练一下：把这篇知识用于一个小判断</strong><small>完全可选 · 不影响继续阅读</small></span></summary><div class="reading-practice-body markdown-body">${renderMarkdown(parts.practice, article.path)}</div></details>` : "";
    const nextLinks = `<nav class="reader-next" aria-label="主线上一篇和下一篇">${previous ? `<a href="${articleHref(previous)}"><span>上一篇</span><strong>${C.escapeHtml(previous.title)}</strong></a>` : '<span class="reader-next-empty">这是主线第一篇</span>'}${next ? `<a class="next" href="${articleHref(next)}"><span>下一篇</span><strong>${C.escapeHtml(next.title)}</strong></a>` : '<a class="next" href="#/directory"><span>主线读完后</span><strong>回到学习路线自由探索</strong></a>'}</nav>`;
    app.innerHTML = C.regularShell(active, `<main id="main-content" class="reader-container" data-route="reader"><article class="reader-article"><header class="reader-heading"><a class="text-link" href="${backHref}">← 返回${article.pageType === "core-spine" ? "学习路线" : article.mode === "lab" ? "案例" : "知识检索"}</a><span class="reader-kicker">${C.escapeHtml(readerKicker)}</span><h1>${C.escapeHtml(article.title)}</h1></header><div class="markdown-body">${renderMarkdown(parts.reading, article.path)}</div>${practice}${readingIndex >= 0 ? nextLinks : ""}</article><aside class="reader-side"><strong>${readingIndex >= 0 && currentStage ? currentStage.title : "按需阅读"}</strong><p>${readingIndex >= 0 && currentStage ? currentStage.question : "这是一篇补充内容，不会打断你的主线位置。"}</p>${readingIndex >= 0 && currentStage ? `<span class="reader-stage-position">本阶段第 ${currentStagePosition} / ${currentStageItems.length} 篇</span>` : ""}${next ? `<a class="reader-side-next" href="${articleHref(next)}"><small>下一篇</small><strong>${C.escapeHtml(next.title)}</strong></a>` : ""}<a href="#/directory">查看六步学习路线</a><a href="#/reference">遇到术语，去搜索</a>${parts.practice ? '<a href="#reading-practice-note" data-open-practice>文末有可选练习</a>' : ""}</aside></main>`);
    document.querySelector("[data-open-practice]")?.addEventListener("click", (event) => { event.preventDefault(); const details = document.querySelector(".reading-practice"); if (details) { details.open = true; details.scrollIntoView({ block: "start" }); } });
    bindCommon();
  }

  const portfolioDefinitions = [
    {
      id: "artifact-task-card-v1", stage: "Prompt", title: "Prompt 任务卡", route: "#/learn/first-task", nextUse: "为同一判断选择 Context 材料",
      criteria: [["goal-present", "使用者与用途明确"], ["materials-present", "输入材料范围明确"], ["output-present", "输出形态可执行"], ["acceptance-count", "至少三条验收条件"], ["acceptance-observable", "验收条件可观察"], ["human-responsibility", "人类责任明确"]]
    },
    {
      id: "artifact-context-template-v1", stage: "Context", title: "Context 材料包", route: "#/learn/stage/context", nextUse: "作为 Workflow 的受控输入",
      criteria: [["budget", "材料总量在预算内"], ["version", "没有混用被替代版本"], ["decision-evidence", "包含支持当前决定的材料"], ["signal", "没有低信号材料挤占预算"], ["exclusion-reason", "排除理由可解释"]]
    },
    {
      id: "artifact-workflow-v1", stage: "Workflow", title: "Workflow", route: "#/learn/stage/workflow", nextUse: "判断动态分支是否需要 Agent Loop",
      criteria: [["workflow-boundaries", "开始与结束边界明确"], ["workflow-gate", "不可逆动作前有人工门"], ["workflow-exception", "来源冲突有独立状态"], ["workflow-output", "每个状态有可观察产物"]]
    },
    {
      id: "artifact-agent-loop-v1", stage: "Agent Loop", title: "Agent 运行卡", route: "#/learn/stage/agent", nextUse: "识别最小 Harness 的运行控制",
      criteria: [["agent-observation", "当前观察有记录", (item) => Boolean(item.observation)], ["agent-action", "行动与工具选择有记录", (item) => Boolean(item.action)], ["agent-state-update", "工具结果改变了状态", (item) => Boolean(item.outcome)], ["agent-trace", "Trace 可回看", (item) => Array.isArray(item.trace) && item.trace.length >= 3], ["agent-recovery", "停止、重试和恢复点明确", (item) => Boolean(item.recoveryPoint) && Number(item.retryLimit) >= 0]]
    },
    {
      id: "artifact-minimum-harness-v1", stage: "Harness", title: "最小 Harness", route: "#/learn/stage/harness", nextUse: "补齐 Eval 后封装能力资产",
      criteria: [["local-read", "本地只读动作最小授权"], ["external-query", "外部查询保留人工确认"], ["draft-write", "草稿写入可控"], ["send-result", "发送动作不自动放行"], ["eval-fact", "关键事实有来源证据"], ["eval-decision", "结论服务于真实决定"], ["eval-risk", "风险与未知项已披露"], ["eval-evidence", "评分能指回证据"], ["eval-trajectory", "越权轨迹阻断通过"]]
    },
    {
      id: "artifact-capability-package-v1", stage: "Skill / AgentOS", title: "Skill / AgentOS 能力资产包", route: "#/learn/stage/asset", nextUse: "在第二个真实任务中迁移并回归",
      criteria: [["asset-applicability", "适用与不适用边界明确"], ["asset-owner", "维护 Owner 明确"], ["asset-version", "版本可识别"], ["asset-handoff", "Handoff 足以接续"], ["asset-eval", "Eval 基线与失败回流可见"], ["asset-boundary", "私有与共享边界清楚"]]
    }
  ];

  function portfolioEvidence(item, definition) {
    if (!item) {
      return definition.criteria.map(([id, label]) => ({ id, label, pass: false, evidence: "尚未创建这份作品。", fix: "从对应练习开始，保存 required 条件证据。", kind: "deterministic" }));
    }
    const stored = [...(Array.isArray(item.criterionResults) ? item.criterionResults : []), ...(Array.isArray(item.evalResults) ? item.evalResults : [])];
    const byId = new Map(stored.filter((result) => result && result.id).map((result) => [result.id, result]));
    return definition.criteria.map(([id, label, fallback]) => {
      const result = byId.get(id);
      if (result) return { id, label, pass: result.pass === true, evidence: result.message || (result.pass ? "检查已满足。" : "检查未满足。"), fix: result.fix || (result.pass ? "" : "回到对应练习补充证据。"), kind: result.kind || "deterministic" };
      const compatiblePass = typeof fallback === "function" ? fallback(item) : false;
      return { id, label, pass: compatiblePass, evidence: compatiblePass ? "从旧作品字段读取到兼容证据。" : "旧作品未保存这项条件级证据。", fix: compatiblePass ? "" : "回到对应练习重新检查；不会把缺字段自动判为通过。", kind: "deterministic" };
    });
  }

  function renderPortfolioCard(item, definition, index) {
    const results = portfolioEvidence(item, definition);
    const passed = results.filter((result) => result.pass);
    const pending = results.filter((result) => !result.pass);
    const rawVersion = item && item.version != null ? String(item.version) : "";
    const version = rawVersion ? (/^v/i.test(rawVersion) ? rawVersion : `v${rawVersion}`) : "未建立";
    const recordedStatus = item && item.status ? item.status : "not_started";
    const statusLabel = recordedStatus === "passed" && pending.length ? "已标记通过 · 证据需补录" : ({ passed: "通过", needs_revision: "待修改", draft: "草稿", not_started: "未开始", ready_to_save: "待保存" }[recordedStatus] || "状态未知");
    const latestFeedback = item && Array.isArray(item.feedbackRecords) && item.feedbackRecords.length
      ? `最近一次规则检查：${C.escapeHtml(item.feedbackRecords[item.feedbackRecords.length - 1].checkedAt || "时间未记录")}`
      : item && (Array.isArray(item.criterionResults) || Array.isArray(item.evalResults))
        ? `当前保存的条件检查：满足 ${passed.length} / ${results.length}`
        : item ? "旧作品没有保存反馈记录，已按可读字段降级检查。" : "完成对应练习后，这里会保存最近反馈。";
    const feedbackKinds = [...new Set(results.map((result) => D.feedbackKinds[result.kind] || result.kind))].join("、");
    const shouldOpen = Boolean(item && (pending.length || index === 0));
    return `<details class="portfolio-card" data-artifact-id="${C.escapeHtml(definition.id)}" ${shouldOpen ? "open" : ""}>
      <summary>
        <span class="eyebrow">${C.escapeHtml(definition.stage)} · ${C.escapeHtml(version)}</span>
        <h2>${C.escapeHtml(definition.title)}</h2>
        <span class="portfolio-summary"><span class="status-word">${C.escapeHtml(statusLabel)}</span><span>required ${passed.length} / ${results.length}</span><span>${pending.length ? `待修改 ${pending.length} 项` : "待修改：无"}</span></span>
      </summary>
      <div class="portfolio-evidence">
        <section aria-labelledby="criteria-${C.escapeHtml(definition.id)}"><h3 id="criteria-${C.escapeHtml(definition.id)}">Required 条件</h3><ul class="criteria-list">${results.map((result) => `<li data-criterion-status="${result.pass ? "met" : "unmet"}"><span class="criterion-state">${result.pass ? "已满足" : "未满足"}</span><span><strong>${C.escapeHtml(result.label)}</strong><small>${C.escapeHtml(result.evidence)}</small></span></li>`).join("")}</ul></section>
        <section class="evidence-block"><h3>最近反馈</h3><p>${latestFeedback}</p><p class="muted">反馈证据：${C.escapeHtml(feedbackKinds)}。事实真伪、组织权限与最终发布仍需人工核验。</p></section>
        <section class="evidence-block"><h3>待修改项</h3>${pending.length ? `<ol>${pending.map((result) => `<li><strong>${C.escapeHtml(result.label)}</strong><span>${C.escapeHtml(result.fix)}</span></li>`).join("")}</ol>` : "<p>无；当前 required 条件均有通过证据。</p>"}</section>
        <section class="evidence-block"><h3>下一次复用</h3><p>${C.escapeHtml(item && item.nextUse || definition.nextUse)}</p><a href="${definition.route}">${pending.length ? "回到对应练习修改" : "打开作品并创建下一版"}</a></section>
        <code>${C.escapeHtml(definition.id)}</code>
      </div>
    </details>`;
  }

  function renderPortfolio() {
    const state = S.load(); const task = taskArtifact(state, false); const legacy = state.legacyReadingHistory || { completedPaths: [], importStatus: "not_checked" };
    const items = portfolioDefinitions.map((definition) => state.artifacts[definition.id] || state.drafts[definition.id] || null);
    const passedCount = items.filter((item) => item && item.status === "passed").length;
    const currentDefinition = portfolioDefinitions.find((definition, index) => !items[index] || items[index].status !== "passed") || portfolioDefinitions[portfolioDefinitions.length - 1];
    app.innerHTML = C.regularShell("practice", `<main id="main-content" class="container" data-route="portfolio"><header class="page-heading"><span class="eyebrow">练习记录 · 可选</span><h1>如果你做过练习，可以在这里回看</h1><p>六张记录卡对应 Prompt → Context → Workflow → Agent Loop → Harness → Skill / AgentOS。它们用于反馈和复盘，不是继续阅读的门槛。</p></header><section class="notice notice-info portfolio-guide"><strong>不需要为了进度补作业</strong><span>只有在你主动练习时，required、最近反馈和待修改项才有意义。没有练习记录不会影响课程阅读。</span></section><div class="portfolio-grid">${portfolioDefinitions.map((definition, index) => renderPortfolioCard(items[index], definition, index)).join("")}</div><div class="form-actions portfolio-actions"><span class="muted">${passedCount} / 6 份可选练习有通过记录</span><a class="btn-secondary" href="${currentDefinition.route}">${task && task.status !== "passed" ? "打开 Prompt 小练习" : passedCount === 6 ? "在新案例中复用" : `打开可选练习：${C.escapeHtml(currentDefinition.title)}`}</a></div><section class="history-box"><strong>旧版阅读记录 ${legacy.completedPaths.length} 篇</strong><p>导入状态：${C.escapeHtml(legacy.importStatus)}。这些记录只用于保留历史，不会变成作业要求。</p></section></main>`); bindCommon();
  }

  function renderUnknown() {
    app.innerHTML = C.regularShell("learn", `<main id="main-content" class="container" data-route="unknown"><header class="page-heading"><h1>这个页面暂不可用</h1></header>${C.unknownInteraction({ type: "future-block", textAlternative: "当前版本没有这个页面。你可以返回学习路线继续阅读。" })}</main>`); bindCommon();
  }

  function bindCommon() {
    const menu = document.querySelector("[data-menu]"); const nav = document.getElementById("mobile-nav");
    menu?.addEventListener("click", () => { const open = menu.getAttribute("aria-expanded") === "true"; menu.setAttribute("aria-expanded", String(!open)); nav.hidden = open; });
    document.querySelectorAll("[data-retry-storage]").forEach((button) => button.addEventListener("click", () => { S.retry(); render(); }));
    document.querySelectorAll("[data-copy-state], [data-copy-task]").forEach((button) => button.addEventListener("click", async () => {
      const state = S.load(); const artifact = taskArtifact(state, false); const text = artifact ? formatTask(artifact.fields) : JSON.stringify(state, null, 2);
      try { await navigator.clipboard.writeText(text); button.textContent = "已复制"; } catch (_) { window.prompt("复制以下内容", text); }
    }));
  }

  function formatTask(f) { return `目标对象：${f.goalAudience}\n用途：${f.goalUse}\n材料：${f.materials.join("、")}\n输出：${f.outputShape}\n验收：\n- ${f.acceptanceCriteria.filter(Boolean).join("\n- ")}\n人类责任：${f.humanResponsibility}`; }

  function render() {
    const current = route();
    if (current === "/" || current === "/home") renderHome();
    else if (current === "/directory") renderDirectory();
    else if (current === "/learn/first-task") renderFirstTask(false);
    else if (current === "/learn/unit/evolution") renderEvolution();
    else if (current === "/learn/stage/context") renderContext(false);
    else if (current === "/learn/stage/workflow") renderWorkflow(false);
    else if (current === "/learn/stage/agent") renderAgent("missing", null);
    else if (current === "/learn/stage/harness") renderHarness(false);
    else if (current === "/learn/unit/eval") renderEval(false);
    else if (current === "/learn/stage/asset") renderAsset(false);
    else if (current === "/lab") renderLab(null);
    else if (current === "/reference") renderReference();
    else if (current === "/portfolio") renderPortfolio();
    else if (current.startsWith("/read/")) renderReader(current.slice("/read/".length));
    else renderUnknown();
    document.title = `${document.querySelector("h1")?.textContent || "AI 协作知识库"} · AI 协作知识库`;
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }

  window.CourseApp = { render, route, taskArtifact, formatTask, scenarios, renderMarkdown };
  window.addEventListener("hashchange", render);
  render();
})();
