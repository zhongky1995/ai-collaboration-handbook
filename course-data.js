(function () {
  "use strict";

  const stages = [
    { id: "prompt", short: "任务说清", title: "Prompt", control: "目标、输入、输出、验收", failure: "回答看起来不错，却不知道是否能用", artifact: "任务卡" },
    { id: "context", short: "材料选对", title: "Template / Context", control: "变量、材料选择、预算、来源、版本", failure: "材料越塞越多，还混入过时信息", artifact: "上下文材料包" },
    { id: "workflow", short: "过程可查", title: "Workflow", control: "步骤、状态、检查点、人工门", failure: "长任务中途失败，不知道做到哪里", artifact: "工作流" },
    { id: "agent", short: "动态选择", title: "Agent Loop", control: "观察、行动、工具结果、停止、恢复", failure: "路径不确定时硬跑固定流程或无限重试", artifact: "智能体运行卡" },
    { id: "harness", short: "运行可控", title: "Harness", control: "权限、预算、Trace、Eval、异常、成本", failure: "能演示却不安全、不可复现、难定位失败", artifact: "最小运行护栏系统" },
    { id: "asset", short: "能力可复用", title: "Skill / AgentOS", control: "handoff、registry、版本、反馈回流", failure: "只有本人会用，别人无法接手或持续改进", artifact: "能力资产包" }
  ];

  const materials = [
    { id: "meeting-flow-v2", title: "当前会议流程 v2", units: 180, signal: "关键", source: "已核验课程材料", version: "v2", note: "说明现在怎样记录、整理和发布纪要。" },
    { id: "colleague-feedback-a", title: "同事反馈摘录", units: 120, signal: "关键", source: "课程材料", version: "2026-07", note: "3 条对现有流程的体验反馈。" },
    { id: "pilot-constraints-v1", title: "试行约束 v1", units: 160, signal: "关键", source: "已核验课程材料", version: "v1", note: "规定不得自动发布，敏感内容需人工确认。" },
    { id: "decision-criteria-v1", title: "负责人决策标准", units: 130, signal: "关键", source: "已核验课程材料", version: "v1", note: "决策需要效率、准确性、风险三类证据。" },
    { id: "tool-claim-unverified", title: "待核查工具说法", units: 140, signal: "待核查", source: "未核验说法", version: "未知", note: "可能随产品版本变化，不能直接作为结论。" },
    { id: "meeting-flow-v1", title: "过期会议流程 v1", units: 170, signal: "冲突", source: "历史材料", version: "v1", note: "已被 v2 替代，混用会造成版本冲突。" },
    { id: "duplicate-feedback", title: "重复反馈摘录", units: 80, signal: "低信号", source: "课程材料", version: "副本", note: "与同事反馈摘录内容重复。" },
    { id: "visual-style-guide", title: "视觉风格指南", units: 120, signal: "无关", source: "课程材料", version: "v1", note: "与是否试行会议纪要工具的决策无直接关系。" }
  ];


  const units = [
    { id: "learn.prompt.first-task", route: "/learn/first-task", mode: "learn", stage: "prompt", artifactId: "artifact-task-card-v1", progressEligible: true },
    { id: "learn.evolution", route: "/learn/unit/evolution", mode: "learn", stage: "prompt", artifactId: null, progressEligible: false },
    { id: "learn.context.material-choice", route: "/learn/stage/context", mode: "learn", stage: "context", artifactId: "artifact-context-template-v1", progressEligible: true },
    { id: "learn.workflow.state-gates", route: "/learn/stage/workflow", mode: "learn", stage: "workflow", artifactId: "artifact-workflow-v1", progressEligible: true },
    { id: "learn.agent.simulation", route: "/learn/stage/agent", mode: "learn", stage: "agent", artifactId: "artifact-agent-loop-v1", progressEligible: true },
    { id: "learn.harness.permissions", route: "/learn/stage/harness", mode: "learn", stage: "harness", artifactId: "artifact-minimum-harness-v1", progressEligible: true },
    { id: "learn.harness.eval", route: "/learn/unit/eval", mode: "learn", stage: "harness", artifactId: "artifact-minimum-harness-v1", progressEligible: true },
    { id: "learn.asset.package", route: "/learn/stage/asset", mode: "learn", stage: "asset", artifactId: "artifact-capability-package-v1", progressEligible: true }
  ];

  const interactions = [
    { id: "block.task-card-builder", type: "task-card-builder", writes: "artifact-task-card-v1" },
    { id: "block.evolution-ladder", type: "evolution-ladder", writes: "learnerExplanation" },
    { id: "block.context-budgeter", type: "context-budgeter", writes: "artifact-context-template-v1" },
    { id: "block.workflow-builder", type: "workflow-builder", writes: "artifact-workflow-v1" },
    { id: "block.agent-loop-simulator", type: "agent-loop-simulator", writes: "artifact-agent-loop-v1" },
    { id: "block.permission-matrix", type: "permission-matrix", writes: "artifact-minimum-harness-v1" },
    { id: "block.eval-scorer", type: "eval-scorer", writes: "artifact-minimum-harness-v1" },
    { id: "block.before-after", type: "before-after-compare", writes: "artifact-task-card-v1" },
    { id: "block.lab-decision", type: "lab-decision", writes: "migration-artifact" }
  ];

  window.COURSE_DATA = {
    schemaVersion: 1,
    case: {
      id: "case.meeting-brief.v1",
      title: "AI 辅助每周例会纪要试行研究简报",
      task: "为团队负责人制作一页内部资料研究简报，帮助判断是否试行 AI 辅助每周例会纪要。",
      boundary: "所有事实均为固定教学材料；工具说法标记为待核查，不依赖实时联网信息。"
    },
    stages,
    materials,
    units,
    interactions,
    budget: 650,
    feedbackKinds: {
      deterministic: "结构检查",
      bounded_case: "固定案例对照",
      human_verification: "需人工核验"
    }
  };
})();
