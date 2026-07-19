(function () {
  "use strict";

  const observablePattern = /(包含|列出|标注|引用|来源|不超过|一页|至少|3|三|明确|对照|分别|附上)/;

  function result(id, pass, message, fix, kind, field) {
    return { id, pass, message, fix, kind, field, required: true };
  }

  function validateTaskCard(fields) {
    const criteria = (fields.acceptanceCriteria || []).map((item) => String(item || "").trim()).filter(Boolean);
    const selectedMaterials = fields.materials || [];
    return [
      result("goal-present", Boolean(String(fields.goalAudience || "").trim() && String(fields.goalUse || "").trim()), "目标对象和用途都已说明", "补充谁会使用这份简报，以及要用它做什么决定。", "deterministic", "goalAudience"),
      result("materials-present", selectedMaterials.length >= 2, "至少选择了两项可用材料", "选择当前流程与决策标准等能支持判断的材料。", "deterministic", "materials"),
      result("output-present", Boolean(String(fields.outputShape || "").trim()), "输出形态已说明", "说明篇幅、结构或交付形式，例如“一页简报”。", "deterministic", "outputShape"),
      result("acceptance-count", criteria.length >= 3, "至少有三条验收条件", "再补充可逐项检查的验收条件，至少三条。", "deterministic", "acceptance-0"),
      result("acceptance-observable", criteria.length >= 3 && criteria.every((item) => observablePattern.test(item)), "验收条件可观察", "把“专业一点”改成“包含 3 条结论，每条标注材料来源”这类可检查表达。", "bounded_case", "acceptance-0"),
      result("human-responsibility", Boolean(String(fields.humanResponsibility || "").trim()), "人类责任已标出", "写明哪项判断必须由人负责，例如事实、权限或最终发布。", "human_verification", "humanResponsibility")
    ];
  }

  function validateContext(selectedIds, exclusionReasons) {
    const data = window.COURSE_DATA;
    const chosen = data.materials.filter((item) => selectedIds.includes(item.id));
    const used = chosen.reduce((sum, item) => sum + item.units, 0);
    const conflict = selectedIds.includes("meeting-flow-v1") && selectedIds.includes("meeting-flow-v2");
    const hasDecisionEvidence = selectedIds.includes("decision-criteria-v1");
    const lowSignal = selectedIds.some((id) => ["duplicate-feedback", "visual-style-guide"].includes(id));
    const reasonCount = Object.values(exclusionReasons || {}).filter((value) => String(value || "").trim()).length;
    return {
      used,
      remaining: data.budget - used,
      results: [
        result("budget", used > 0 && used <= data.budget, "材料总量在 650 单位预算内", used === 0 ? "先选材料。" : "删除低信号、重复或与本轮判断无关的材料。", "deterministic", "context-materials"),
        result("version", !conflict, "没有混用新旧流程版本", "保留 v2，排除已过期的 v1，并记录排除理由。", "deterministic", "context-materials"),
        result("decision-evidence", hasDecisionEvidence, "已包含负责人决策标准", "补入“负责人决策标准”，否则无法判断简报是否支持决策。", "bounded_case", "context-materials"),
        result("signal", !lowSignal, "未把重复或无关材料挤入预算", "排除重复反馈与视觉指南，把预算留给当前判断。", "bounded_case", "context-materials"),
        result("exclusion-reason", reasonCount >= 1, "已记录至少一项排除理由", "为一项未选择材料写下为什么不进入当前上下文。", "human_verification", "exclusion-reason")
      ]
    };
  }

  function validatePermissions(values) {
    return [
      result("local-read", values.localRead === "allow", "本地教学材料可直接读取", "对已核验、只读的本地材料选择 allow。", "bounded_case", "perm-localRead"),
      result("external-query", values.externalQuery === "ask", "外部查询需先询问", "外部信息可能变化或带来数据风险，本案例先设为 ask。", "bounded_case", "perm-externalQuery"),
      result("draft-write", ["allow", "ask"].includes(values.draftWrite), "写入草稿已受控", "至少选择 ask；仅在隔离草稿区可选 allow。", "human_verification", "perm-draftWrite"),
      result("send-result", ["ask", "deny"].includes(values.sendResult), "发送结果保留人工门", "发送是不可逆动作，不要设为 allow；选择 ask 或 deny。", "deterministic", "perm-sendResult")
    ];
  }

  window.CourseValidators = {
    validateTaskCard,
    validateContext,
    validatePermissions,
    allPassed(results) { return results.every((item) => !item.required || item.pass); }
  };
})();
