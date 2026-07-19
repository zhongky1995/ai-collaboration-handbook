# 示例：生成一张 AIGC 工作流配图

<!-- PRACTICE:START -->
> **任务实验室** · 这里形成迁移作品，不自动授予核心里程碑。先完成任务，再回到主线解释自己用了哪一层控制。

## 任务合同

| 项目 | 本 Lab 要求 |
|---|---|
| 输入 | 工作流信息、图中关系、展示尺寸与公开素材 |
| 选择/步骤 | 先信息结构→再视觉 brief→生成/制作→内容核对→发布检查 |
| 保存物 | 工作流配图 + 验收记录 |
| 质量门 | 图中步骤、方向和术语与正文一致；图片来源和发布权限明确 |

## 反馈怎么用

1. **结构检查**：输入、步骤和保存物是否齐全；
2. **固定案例对照**：只比较本页给出的案例，不冒充通用正确答案；
3. **需人工核验**：事实、版权、组织风险和最终发布必须由人负责。

完成后把失败定位到 Prompt、Context、Workflow、Agent 或 Harness，而不是笼统归因于“模型不行”。
<!-- PRACTICE:END -->

## 深入理解与原有知识

## 这一讲解决什么问题

这一讲用一个完整例子说明：当你需要一张配图时，怎样从用途和表达目标出发，写出视觉 brief，生成候选图，再判断它能不能用于真实场景。

重点不是“生成一张漂亮图”，而是看清完整过程：

```text
任务目标 -> 视觉 brief -> 生成 prompt -> 候选图 -> 人工验收 -> 使用建议
```

## 任务目标

假设你要为一篇讲解 AIGC 工作流的文章准备配图。

这张图要帮助读者理解：

- AIGC 从需求说明开始。
- AI 会生成候选视觉结果。
- 人需要检查和筛选。
- 最终图像要进入真实使用场景。

## 可复用的生成 prompt

下面这段 prompt 可以直接作为参考。它没有只写“画一张 AIGC 图片”，而是说明了用途、画面、风格、构图、颜色和限制条件。

```text
Use case: scientific-educational
Asset type: workflow illustration for an article explaining AIGC
Primary request: create a clean educational illustration showing an AIGC workflow from text brief to generated visual draft to human review to final usable asset.
Scene/backdrop: quiet modern workspace with a laptop, sticky notes, image thumbnails, and a reviewer marking checks.
Subject: a practical content workflow, not fantasy; a person and an AI assistant represented abstractly as a screen interface collaborating on visual content.
Style/medium: polished editorial illustration, semi-flat with subtle depth, suitable for an online learning article.
Composition/framing: 16:9 landscape, clear left-to-right workflow with four visual zones, generous margins, no dense details.
Lighting/mood: bright, calm, professional, learning-oriented.
Color palette: neutral white and soft gray background, teal accent, small warm amber highlights.
Constraints: no readable text, no logos, no brand names, no watermark, no fake UI text; make it understandable through icons, arrows, thumbnails, and review marks only.
Avoid: photorealistic faces, clutter, decorative gradients, sci-fi robots, exaggerated magic effects.
```

## 生成结果

![AIGC 工作流配图](../../assets/aigc/aigc-workflow-sample.png)

这张图没有依赖文字，而是用图标、候选缩略图、勾选和最终输出表现流程。这样做的好处是：即使图像生成模型不能稳定生成准确文字，读者也能看懂画面的主要意思。

## 人工验收

| 检查项 | 结果 | 判断 |
|---|---|---|
| 是否表达流程 | 能看出从说明到候选、验收、最终资产的方向 | 可用 |
| 是否适合文章 | 风格清爽、专业，没有夸张科幻感 | 可用 |
| 是否有文字风险 | 没有可读文字，避免了文字乱码问题 | 可用 |
| 是否有品牌风险 | 没有 logo、品牌名或明显商标 | 可用 |
| 是否需要修改 | 如果用于正式封面，可以进一步强化“人审查”的动作 | 作为文章配图可用 |

## 为什么不在图里写字

很多图像生成模型对复杂文字不稳定，尤其是中文标题、表格和长标签。入门阶段更稳妥的做法是：

- 让图像负责表达场景、流程和氛围。
- 让文章标题、说明和图注负责文字信息。
- 如果必须有准确文字，后期用设计工具或 PPT 手动添加。

这也是 AIGC 使用中的一个重要原则：不要把模型不稳定的部分放到正式使用的关键位置。

## 这张图适合怎么用

它可以作为：

- 文章中解释 AIGC 工作流的配图。
- PPT 中解释“从 brief 到验收”的流程图。
- 视觉 brief 训练的反向拆解材料。

但如果要用于商业宣传、客户材料或品牌官网，还需要进一步做版权、品牌和视觉一致性检查。

## 练习

用同样结构，为你自己的视觉任务写一份生成记录：

```text
任务目标：

视觉 brief：

生成 prompt：

生成结果描述：

人工验收：

最终使用建议：
```

## 验收标准

完成这一讲后，你应该能做到：

- 写出一段适合图像生成的结构化 prompt。
- 生成图需要经过人工验收后再使用。
- 能用检查表判断一张 AIGC 图片是否适合当前任务。
- 知道准确文字、品牌和发布边界需要额外处理。
