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

pass("article count", articleIndex.length === 68, String(articleIndex.length));
pass("generated article count", sandbox.window.LEARNING_ARTICLES?.length === articleIndex.length);
pass("module count", learningIndex.modules?.length === 12, String(learningIndex.modules?.length));

for (const article of articleIndex) {
  const sourcePath = path.join(root, "content", ...article.path.split("/"));
  pass("article exists", fs.existsSync(sourcePath), article.path);
  if (!fs.existsSync(sourcePath)) continue;
  const markdown = fs.readFileSync(sourcePath, "utf8");
  pass("no internal metadata", !/KBV3|canonicalOwner|migrationAction/.test(markdown), article.path);

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
  "learning-index.json", "content-index.json", "README.md"
];
for (const file of publicTextFiles) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const marker of forbidden) pass("forbidden marker absent", !text.includes(marker), `${file}: ${marker}`);
}

for (const asset of ["tokens.css", "styles.css", "content.generated.js", "course-data.js", "validators.js", "storage.js", "components.js", "app.js", "assets/aigc/aigc-workflow-sample.png"]) {
  pass("runtime asset exists", fs.existsSync(path.join(root, asset)), asset);
}

if (failures.length) {
  console.error(`Release check failed (${failures.length})`);
  failures.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`Release check passed: ${articleIndex.length} articles, ${learningIndex.modules.length} modules, no forbidden internal files or markers.`);
