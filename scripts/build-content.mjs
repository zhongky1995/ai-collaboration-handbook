import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const learningIndex = JSON.parse(fs.readFileSync(path.join(root, "learning-index.json"), "utf8"));
const articleIndex = JSON.parse(fs.readFileSync(path.join(root, "content-index.json"), "utf8"));

const articles = articleIndex.map((metadata) => {
  const markdown = fs.readFileSync(path.join(root, "content", ...metadata.path.split("/")), "utf8");
  return {
    ...metadata,
    body: markdown.replace(/(!\[[^\]]*]\()(?:(?:\.\.\/)+)assets\//g, "$1./assets/")
  };
});

const output =
  `window.LEARNING_INDEX = ${JSON.stringify(learningIndex, null, 2)};\n` +
  `window.LEARNING_ARTICLES = ${JSON.stringify(articles, null, 2)};\n`;

fs.writeFileSync(path.join(root, "content.generated.js"), output, "utf8");
console.log(`Generated content.generated.js with ${articles.length} articles.`);
