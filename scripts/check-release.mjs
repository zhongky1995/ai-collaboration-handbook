import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];
const pass = (name, condition, detail = "") => {
  if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
};

const learningIndex = JSON.parse(fs.readFileSync(path.join(root, "learning-index.json"), "utf8"));
const articleIndex = JSON.parse(fs.readFileSync(path.join(root, "content-index.json"), "utf8"));
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "content.generated.js"), "utf8"), sandbox);

const detailContracts = new Map([
  ["C-08", ["同一段原文，因为使用目的不同", "快速理解发生了什么", "帮助项目负责人推进", "发给相关同事同步"]],
  ["C-09", ["把四句对话拆成三种状态", "暂不确定发布日期", "李明周三下班前提交风险清单", "未决问题"]],
  ["C-10", ["今天要判断是否进入小范围试点", "试点设计表", "决策页", "每一页仍应推动一个明确判断"]],
  ["C-11", ["不要平均用力", "现行制度要求所有客户数据不得进入外部工具", "事实核查的目标是保护关键判断"]],
  ["A-02", ["状态不是聊天记录", "同步循环与异步续跑不是一回事", "恢复不是无限重试"]],
  ["R-03", ["一个任务为什么可能需要多种工具", "核对当前功能与发布日期", "每种工具只承担它擅长且能被检查的动作"]],
  ["R-05", ["用会议纪要看角色怎样变化", "什么时候值得从使用者走向建设者", "过早建设会把偶然做法固化成负担"]],
  ["L-01", ["可选案例实验室", "任务合同", "学习路径要通向可检验的作品"]],
  ["L-03", ["字段检查通过，只证明记录填全", "问题求助卡", "假设的修改过程", "资料核查面板示例"]]
]);

pass("article count", articleIndex.length === 36, String(articleIndex.length));
pass("generated article count", sandbox.window.LEARNING_ARTICLES?.length === articleIndex.length);
const expectedLayers = { orientation: 3, core: 16, advanced: 8, reference: 5, lab: 3, workbook: 1 };
for (const [layer, expected] of Object.entries(expectedLayers)) {
  const actual = sandbox.window.LEARNING_ARTICLES?.filter((article) => article.layer === layer).length || 0;
  pass(`${layer} unit count`, actual === expected, `${actual} / ${expected}`);
}
pass("course structure exists", Boolean(sandbox.window.COURSE_STRUCTURE?.core?.modules), "COURSE_STRUCTURE");

for (const article of articleIndex) {
  const sourcePath = path.join(root, "content", ...article.path.split("/"));
  pass("article exists", fs.existsSync(sourcePath), article.path);
  if (!fs.existsSync(sourcePath)) continue;
  const markdown = fs.readFileSync(sourcePath, "utf8");
  pass("no internal metadata", !/KBV3|canonicalOwner|migrationAction/.test(markdown), article.path);

  const practiceCount = (markdown.match(/<!-- PRACTICE:START -->/g) || []).length;
  const shouldFoldPractice = article.layer === "core"
    || article.layer === "reference"
    || (article.layer === "advanced" && article.unitId !== "A-08");
  pass("practice structure matches page role", practiceCount === (shouldFoldPractice ? 1 : 0), `${article.unitId}: ${practiceCount}`);
  const readingBody = markdown.split("<!-- PRACTICE:START -->", 1)[0];
  if (shouldFoldPractice) {
    pass("legacy task wrapper absent from reading", !/当前作品|升级门|进度证据/.test(readingBody), article.unitId);
  }
  if (article.layer === "reference") {
    pass("reference starts with quick judgment", readingBody.includes("## 30 秒判断"), article.unitId);
  }
  if (article.layer === "lab") {
    pass("lab exposes task contract", readingBody.includes("## 任务合同"), article.unitId);
  }
  const requiredDetails = detailContracts.get(article.unitId) || [];
  pass("novice detail contract", requiredDetails.every((text) => readingBody.includes(text)), article.unitId);

  for (const match of markdown.matchAll(/!?\[[^\]]*]\(([^)]+)\)/g)) {
    const link = match[1].split("#")[0];
    if (!link || /^(https?:|mailto:|data:)/i.test(link)) continue;
    const resolved = path.resolve(path.dirname(sourcePath), link);
    pass("local link resolves", fs.existsSync(resolved), `${article.path} -> ${link}`);
  }
}

const forbidden = ["_kb-control", "_task-control", ".playwright-cli", ".DS_Store", "/Users/", "/var/folders/"];
const publicTextFiles = [
  "index.html", "app.js", "components.js", "course-data.js", "storage.js", "validators.js",
  "learning-index.json", "content-index.json", "course-structure.json", "README.md", "assets/demos/evidence-panel.html"
];
for (const file of publicTextFiles) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const marker of forbidden) pass("forbidden marker absent", !text.includes(marker), `${file}: ${marker}`);
}

for (const asset of ["tokens.css", "styles.css", "content.generated.js", "course-data.js", "validators.js", "storage.js", "components.js", "app.js", "assets/aigc/aigc-workflow-sample.png", "assets/demos/evidence-panel.html", "course-structure.json"]) {
  pass("runtime asset exists", fs.existsSync(path.join(root, asset)), asset);
}

if (failures.length) {
  console.error(`Release check failed (${failures.length})`);
  failures.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`Release check passed: ${articleIndex.length} formal units, three-layer structure, no forbidden internal files or markers.`);
