# Number Spinner｜六个首发数字范围页的站内 SEO 增值记录

日期：2026-11-12。范围：`/random-number-wheel/1-3/`、`1-4/`、`1-5/`、`1-6/`、`1-20/`、`1-100/`。本次不需要 Google Search Console，也不改变首发 13 URL 白名单。

## 改进缘由

之前六页虽然有独立标题、描述、数字预设和少量示例，但正文围绕同一个通用数字转盘模板，用户未必能快速判断“允许重复”和“只抽一次”哪个更适合自己的任务。

本次给每页两个具体的操作情景，解释输入、重复策略、结果含义及使用限制。Google 的 people-first 内容原则强调内容帮助用户完成目的，并不要求为排名增加固定字数。

官方参考：https://developers.google.com/search/docs/fundamentals/creating-helpful-content

## 已提交代码

- `src/data/approved-range-guides.ts`：6 个唯一页面标题、12 个实际操作场景、可校验的一键设置预设。
- `src/components/ApprovedRangeGuide.astro`：面向用户的场景卡片，含步骤、结果说明、辅助技术可读的反馈。
- `src/scripts/range-presets.ts`：点击场景按钮后配置默认范围、步长、排除号码、批量数量、重复模式和 Quick Pick/Spin 模式；不自动抽取，不上传数据。
- `src/pages/random-number-wheel/[range].astro`：仅对已获准的六个范围渲染场景组件。十个暂缓索引的数字范围页不会获得该组件，也不会因此解除 `noindex`。
- `src/styles/refinements.css`：双栏桌面卡片和单栏移动端布局。
- `tests/approved-range-guides.test.ts`：校验六个固定范围、十二个独特示例、批量数量与不重复规则。
- `tests/seo-launch.e2e.spec.ts`：校验六页渲染、候选页不混入专属内容、1–20 缺席号码一键设置、1–6 重复规则切换。
- `scripts/audit-pages.mjs`：正式构建静态检查要求获准六页具备两套可操作场景设置，其他页面不得冒用。

## 六页的真实独立价值

| 范围 | 独立场景 A | 独立场景 B |
| --- | --- | --- |
| 1–3 | 选择三项活动之一 | 三人位置随机排序 |
| 1–4 | 四角游戏 | 四组分配不重复站位 |
| 1–5 | 五项暖场活动 | 五项任务随机轮换 |
| 1–6 | 可重复的骰子式选数 | 不重复的六位次分配 |
| 1–20 | 排除 4/7/12 三个缺席学号后抽取 | 十七个在场学号的不重复抽取 |
| 1–100 | 快速随机数字 | 100 个号码中抽取 10 个不同值 |

**保留前提**：这些场景是实际工作流，不是六篇机械修改数字的 SEO 文章。未来扩页应先证明新工具确有独立搜索意图和使用价值，而不是复制这个组件就放开索引。

## 验收等级和当前限制

已确认：GitHub 源码和测试代码已提交；独特数据项、组件绑定、预设动作与静态审计之间的代码引用存在。

尚未验证：完整 `npm run check`、`npm test`、`npm run build`、Playwright 运行结果，Cloudflare Pages 最新部署，真实手机可用性和性能。尚未验证的内容不可标记为成功。

本阶段不检查 Search Console，不测试联系邮箱收发。
