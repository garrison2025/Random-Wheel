# NumberSpinner.com｜站内 SEO 专项审计（不依赖 Search Console）

**审计日期：2026-11-12**  
**基准：** Random Wheel 完整建站方案 V1.2（2026-11-11）和 GitHub `main` 当前代码。  
**目标：** 免费英文工具站，以 SEO 流量和展示广告为主要商业方向；不转为订阅 SaaS。  
**边界：** 用户目前未接入 Google Search Console；**本轮不检查 GSC/排名/收录数据，也不做联系邮箱收发测试**。用户已确认正式域名 `numberspinner.com` 在 Cloudflare Active 且能访问，但当前工具未取得完整实站响应或浏览器性能数据。代码已提交、静态审计脚本语法通过，不能等同于线上构建或真实移动端验收通过。

## 一、已复核的 SEO 基础架构

- Astro 静态页面可在不依赖 JS 绘制正文的情况下输出 H1、Title、Description 和内部链接。
- 官方 Canonical 目标固定为 `https://numberspinner.com`。若生产环境设置了错误的 `PUBLIC_SITE_URL`，开启索引应被构建审核阻止，避免输出错误的规范域名。
- **8 个首发工具入口 + 5 个支持页**维持原先的 13 URL 白名单；另 **13 个候选 URL 保持 noindex**，暂不进入 Sitemap。
- 预览构建使用 `noindex, nofollow`；正式站中暂缓索引的页面使用 `noindex, follow`，保留跳转到已开放工具页的导航能力。不等于公开索引候选 URL。
- `404.html`、WebSite JSON-LD、品牌标签及静态 SEO 审计已有独立规则。
- 既有六个批准范围：`1-3`、`1-4`、`1-5`、`1-6`、`1-20`、`1-100`；各有专属标题、默认数池、短介绍、使用场景和提示。

## 二、本次源码直接修复

| 优先级 | 发现 | 修复 |
|---|---|---|
| P1 | 数字范围页缺少明确的上级导航层级 | 通用数字页及所有数字范围页新增可见语义化面包屑；正式获准页面配套 BreadcrumbList JSON-LD |
| P1 | 数字范围页“Related”反复链接到自己，锚文本只有数字 | 改为其他获准首发范围的语义化文字链接，消除自链接；保留自定义范围入口 |
| P1 | 通用数字页把未批准索引的范围排在首批主要卡片之前 | 首屏范围入口仅放六个批准范围，并将 `1–100`、`1–3` 等高意图页面优先展示；其他候选留在工具目录 |
| P1 | 工具目录无清晰主次，未批准范围数据顺序靠前 | 将主要范围工具与其他范围工具分组，仍保留 21 个原有工具入口 |
| P1 | 官方索引域名校验过于宽松，错误的旧域名也可通过 | 锁定 `https://numberspinner.com`，不接受旧域名、www、任意其他域名作为发布 Canonical |
| P2 | 字体通过 CSS `@import`，增加资源发现链条 | 改在 HTML `<head>` 内直接加载 Google Fonts 样式，保留 preconnect 和 `display=swap` |
| P2 | 工具目录主 H1 过于宽泛 | 调整为明确描述页面的 `Free Random Wheel & Number Picker Tools` |
| P2 | 正式站的 noindex 候选页同样被设置为 nofollow | 将正式候选页设置为 `noindex, follow`；预览版维持 `noindex, nofollow` |

同时修订 `scripts/audit-pages.mjs`、`scripts/audit-candidate-gates.mjs` 和单元/Playwright 测试，使新增结构与原有索引闸门一起接受构建检查。

## 三、当前页面与关键词对应关系

| 页面 | 核心搜索需求 | 站内优化重点 |
|---|---|---|
| `/` | spin the wheel、choice picker | 首屏就能编辑/抽取，首发数字工具链接优先 |
| `/random-number-wheel/` | random number wheel、number spinner | 自定义范围为主工具，主卡片先推荐六个批准范围 |
| `/random-number-wheel/1-100/` | random number generator 1-100 | 快速立即出数为主要意图；动画为可选 |
| `/random-number-wheel/1-3/` | pick a number 1-3 | 三选一立即结果、可选等分转盘 |
| `/random-number-wheel/1-4/` | number randomizer 1-4 | 四选一/课堂分组 |
| `/random-number-wheel/1-5/` | pick a number 1-5 | 五选一/不同活动分配 |
| `/random-number-wheel/1-6/` | number generator 1-6 | 骰子类重复抽取（默认不移除中奖者） |
| `/random-number-wheel/1-20/` | random number 1-20 | 课堂抽号、排除缺席号码和无重复抽取 |

V1.2 提供的关键词数据来自 2026-11-09 美国 Semrush 竞品记录，是搜索意图优先级的依据，**不是 NumberSpinner.com 的真实曝光或流量数据**。

## 四、仍未完成的“网站本身”质量验收

1. **完整构建质量**：`npm run check`、`npm test`、`npm run build`、静态 SEO 审核和 Playwright 测试必须看到实测成功结果。代码提交及脚本语法检查不等于成功。
2. **正式站实际 HTML**：在用户确认 Active 的域名上检查页面的 title/description/H1/canonical、robots、结构化数据输出、404 HTTP 状态和 301；外部抓取工具本轮未取得足够响应，不能虚构结果。
3. **移动端体验与速度**：针对首页、通用数字转盘、`1-100` 进行 Lighthouse、INP/LCP/CLS 和触屏操作验收。字体加载优化是代码层改动，未获得性能得分或实际提速证明。
4. **页面独特价值**：六个首发范围页虽然有不同示例和目的，但共享模板比重较高。后续优先用真正的工具能力/场景解决方案提升差异化，不为填字数制造重复说明。
5. **后续 13 个候选页**：按照 `docs/seo-competitor-gates.json` 保持原状态：`PROMISING_NOT_APPROVED` 2 个、`FIX_FIRST` 6 个、`HOLD` 5 个。不能为了扩展关键词而直接开启收录。

## 五、本轮源代码校验边界

已确认新增 Breadcrumb 组件、语义化锚文本、主次分组、正式域名锁定、字体入口和 noindex 规则均存在于 GitHub `main`；两个 SEO 审核脚本通过 JavaScript 静态语法检查。

尚未取得整站 Astro/TypeScript 构建、真实浏览器回归和完整正式域名 HTTP 验收记录。因此本轮结论是：**站内 SEO 的确定性缺陷已修复并提交，代码审计已完成一轮，实站验证仍独立待办。**

本报告不要求先接入 Google Search Console。
