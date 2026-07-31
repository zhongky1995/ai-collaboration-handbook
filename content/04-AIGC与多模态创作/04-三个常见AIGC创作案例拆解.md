# 三个常见 AIGC 创作案例拆解

<!-- PRACTICE:START -->
> **任务实验室** · 这里形成迁移作品，不自动授予核心里程碑。先完成任务，再回到主线解释自己用了哪一层控制。

## 任务合同

| 项目 | 本 Lab 要求 |
|---|---|
| 输入 | 案例目标、平台约束、素材权利与验收重点 |
| 选择/步骤 | 按案例识别变量→选择控制手段→记录失败→形成迁移规则 |
| 保存物 | 案例对照卡 |
| 质量门 | 能说明差异来自何种机制，而不是只挑最好看结果 |

## 反馈怎么用

1. **结构检查**：输入、步骤和保存物是否齐全；
2. **固定案例对照**：只比较本页给出的案例，不冒充通用正确答案；
3. **需人工核验**：事实、版权、组织风险和最终发布必须由人负责。

完成后把失败定位到 Prompt、Context、Workflow、Agent 或 Harness，而不是笼统归因于“模型不行”。
<!-- PRACTICE:END -->

## 用三个案例观察同一套创作判断

前面已经知道视觉 brief 和创作技巧。这一讲把方法放进三个真实场景：公司学习活动图、PPT 封面、图生视频分镜。

这三个案例不是要证明 AI 可以替代设计，而是训练你如何把人的表达目标交给 AI 生成候选，再由人按场景验收和修改。

你要重点看两件事：

1. 同一个需求怎样从模糊想法变成可执行 prompt。
2. 不同场景的验收标准有什么不同。

## 案例一：公司群里的 AI 学习活动图

### 原始需求

```text
帮我做一张适合发在公司群里的 AI 学习活动图。
```

这个需求看起来简单，但缺了四件事：活动目的、受众、画面主角、发布风险。

### 改写成视觉 brief

```text
使用场景：
公司群里的 AI 学习活动预告图，用于提醒同事报名或参加。

表达目标：
传达“AI 学习是一个轻量、可参与、面向真实工作的活动”，不要像大型发布会海报。

目标读者：
业务、运营、产品、市场等岗位同事，可能已经用过 AI，但没有系统方法。

画面主体：
几位同事围绕一张桌子整理任务卡、笔记本电脑和便利贴，屏幕上有抽象的 AI 协作界面。

风格：
清爽、亲和、企业内部学习氛围，现代插画或轻 3D 均可。

构图：
竖版 4:5 或 9:16，顶部留出后期添加标题的位置。

限制：
不要真实公司 logo，不要可读文字，不要机器人，不要夸张科幻背景。

验收标准：
画面要像“同事一起学习和实践”，而不是“AI 技术大会海报”。
```

### 生成 prompt

```text
Vertical 4:5 modern editorial illustration for an internal company AI learning activity. Several knowledge workers sit around a clean table with laptops, task cards, notebooks, and sticky notes. A subtle abstract AI collaboration interface appears on one laptop screen, shown only through icons and simple shapes, no readable text. Friendly, practical, work-focused atmosphere. Soft white and light gray background, teal and warm yellow accents. Leave clean space at the top for a title added later. No logos, no readable words, no robots, no sci-fi glowing brain, no watermark.
```

### 你要检查什么

| 检查项 | 为什么重要 |
|---|---|
| 顶部是否有留白 | 后期要加标题，不要让画面占满 |
| 人物是否像真实办公学习 | 避免变成夸张科技宣传 |
| 是否有乱码文字 | 群发图里乱码很显眼 |
| 是否有品牌元素 | 公司内部使用也要避免误用 logo |
| 是否能看出“活动”而不是“工具广告” | 画面要服务报名或参与 |

### 常见迭代

如果画面太像发布会：

```text
把场景改成小型团队学习，不要舞台、聚光灯、演讲台或大型屏幕。
```

如果画面太儿童化：

```text
降低卡通感，改成更克制的企业内部学习插画，人物比例自然，颜色更浅。
```

## 案例二：PPT 封面视觉

### 原始需求

```text
帮我做一张 AI 协作主题的 PPT 封面。
```

PPT 封面和文章配图不同。封面更关心版式空间、标题承载和第一眼主题。

### 改写成视觉 brief

```text
使用场景：
一份企业内部分享 PPT 的封面背景图。

表达目标：
体现“人把表达目标和任务材料交给 AI，AI 生成候选结果，人再做判断和验收”的协作关系。

画面主体：
一张宽屏工作台，左侧是任务卡和资料，右侧是几张候选输出缩略图，中间用简洁线条表达流转。

构图：
16:9 横版，左侧和上方保留大面积空白，方便后期放标题和副标题。

风格：
冷静、专业、适合汇报，不要营销感太强。

限制：
不要生成文字，不要 logo，不要真实软件界面，不要过暗背景。
```

### 生成 prompt

```text
16:9 landscape background illustration for a professional presentation cover about human-AI collaboration. A clean wide desk scene: on the left, task cards and source documents; in the center, a subtle abstract AI interface represented by simple geometric shapes; on the right, three visual output thumbnails being reviewed with check marks. Large clean empty space on the upper left for a title added later. Calm professional style, soft white and light gray background, restrained teal accent, gentle depth, no readable text, no logos, no fake software UI, no dark sci-fi look.
```

### 你要检查什么

| 检查项 | 判断方法 |
|---|---|
| 标题空间 | 把 PPT 标题放上去后是否拥挤 |
| 视觉焦点 | 画面是否服务“人机协作”，不是泛泛 AI 氛围 |
| 背景干净度 | 是否影响文字可读性 |
| 颜色克制 | 是否适合企业汇报，不抢内容 |
| 后期可编辑性 | 是否能在 PPT 里加标题、遮罩或裁切 |

### 常见迭代

如果画面太满：

```text
简化右侧候选图数量，只保留 3 个缩略图；左上方保持更大留白。
```

如果太像科技广告：

```text
去掉霓虹光效和未来城市背景，改成真实办公桌和知识工作场景。
```

## 案例三：把一张配图变成 8 秒视频分镜

### 原始需求

```text
把这张 AIGC 工作流图做成一个短视频。
```

视频不能只写“动起来”。你要说明时间、镜头、动作和不要改变的部分。

### 图生视频 prompt

```text
基于这张图生成 8 秒视频。

0-2 秒：
镜头从左侧视觉 brief 区域缓慢推进，桌面和卡片轻微浮动。

2-5 秒：
候选图缩略图依次亮起，形成从左到右的流程感。

5-8 秒：
勾选标记落在最终素材上，镜头停在最终图附近。

镜头：
一镜到底，缓慢平稳推进，不要快速切镜，不要旋转。

必须保持：
原始画面构图、人物位置、桌面布局、颜色风格。

必须避免：
不要新增文字，不要改变人物，不要新增 logo，不要出现夸张粒子特效。
```

### 你要检查什么

| 检查项 | 判断方法 |
|---|---|
| 动作是否简单 | 8 秒里不要塞三四个故事 |
| 镜头是否稳定 | 不要忽然切换、乱转、主体出框 |
| 主体是否漂移 | 人物、桌面、候选图不要变形 |
| 是否新增文字 | 避免乱码或不必要的信息 |
| 是否可用作分镜 | 即使不能直接发布，也能指导后期制作 |

### 常见迭代

如果画面变化太剧烈：

```text
降低运动强度，只保留轻微推进和候选图高亮，不要转场，不要新增场景。
```

如果主体变形：

```text
保持人物和桌面布局完全不变，只让候选图缩略图和勾选标记轻微运动。
```

## 三个案例的共同方法

| 场景 | 关键控制点 | 最容易失败的地方 |
|---|---|---|
| 活动图 | 受众、氛围、标题留白 | 太像广告或科技发布会 |
| PPT 封面 | 版式空间、主题焦点、文字承载 | 画面太满，影响标题 |
| 图生视频 | 时间线、镜头、主体稳定 | 动作太多，主体漂移 |

你会发现，AIGC prompt 不是越华丽越好，而是越像一个清楚的创作说明越好。

## 练习

从下面三个任务里任选一个，写出视觉 brief、生成 prompt 和验收清单：

1. 一张“AI 协作工作坊”的活动图。
2. 一张“AI 资料研究方法”的 PPT 封面。
3. 一个“从资料到报告”的 8 秒图生视频分镜。

## 验收标准

完成这一讲后，你应该能做到：

- 根据不同使用场景写不同 prompt。
- 不把文章配图、PPT 封面和短视频分镜混成一种写法。
- 能说清每个案例最重要的验收点。
- 能用具体反馈继续迭代，而不是只说“再高级一点”。
