# Number Spinner｜正式域名上线验收（2026-11-12）

## 已知信息与尚未验证的状态

- 用户已购买 `numberspinner.com`，并表示已在 Cloudflare 添加域名。
- 公开联系地址：`contact@numberspinner.com`。
- GitHub 项目：`garrison2025/Random-Wheel`；既有 Pages 项目：`random-wheel-58c.pages.dev`。
- 唯一规范域名：`https://numberspinner.com`（不使用 www）。
- **独立验证尚未完成**：Cloudflare Zone Active ≠ Pages Custom domains Active；是否签发 HTTPS 证书、是否运行最新构建、www 和 pages.dev 是否 301、邮箱收发能力、GSC 验证和收录，均应以实测为准。

## 一、Cloudflare Pages 关联域名

1. Cloudflare Dashboard → **Workers & Pages** → 已有 Random Wheel Pages 项目。
2. **Custom domains** 中确认 `numberspinner.com` 的状态为 **Active**。仅在站点的 DNS 区域出现该域名还不算 Pages 成功绑定。
3. 如果没有列出该域名，选择 **Set up a custom domain**，输入 `numberspinner.com`，按向导完成。不要额外创建 Pages 项目。
4. 在部署记录中确认项目部署的 Git commit 与仓库 `main` 最新提交一致，且构建状态为 Success。

官方文档：https://developers.cloudflare.com/pages/configuration/custom-domains/

## 二、环境变量和正式索引

### Production（生产部署）变量

| 名称 | 值 |
| --- | --- |
| `PUBLIC_SITE_URL` | `https://numberspinner.com` |
| `PUBLIC_INDEXABLE` | `true` |

在 Pages → Settings → Variables and Secrets / Environment variables 中配置。代码在没有 `PUBLIC_SITE_URL` 时也默认官方域名，但是明确配置有助于避免歧义。

**先核对 HTTPS、首页/工具页 200、www 和 pages.dev 的 301，再开启生产 `PUBLIC_INDEXABLE=true` 并重新部署。** Astro 静态站的 robots/canonical/sitemap 是构建期生成的，更改环境变量后必须重新构建。

Preview（预览部署）：`PUBLIC_INDEXABLE` 不设置或设为 `false`。不要把生产值复制到 Preview。注意 `random-wheel-58c.pages.dev` 的正式生产别名和 `<hash>.random-wheel-58c.pages.dev` 的预览部署不是同一回事。

代码预设发布白名单恰好 13 个 URL；其他 13 个候选 URL 即便开启生产索引，仍然显式 `noindex`，不会进入 Sitemap。未经单独审核不得扩大白名单。

## 三、统一 301 重定向，避免重复域名

在 Cloudflare 账户级 **Bulk Redirects** 配置，尽量保留原路径和查询参数：

| 来源 | 目标 | 状态 |
| --- | --- | --- |
| `https://www.numberspinner.com` | `https://numberspinner.com` | 301 |
| `https://random-wheel-58c.pages.dev` | `https://numberspinner.com` | 301 |

启用：**Subpath matching**、**Preserve path suffix**、**Preserve query string**。给 www 按 Cloudflare 官方指南建立能触发重定向规则的代理 DNS 记录；如已存在记录，应先检查，不能盲目覆盖。HTTP 应跳 HTTPS。对于生产 `pages.dev` 别名，不要误以为预览部署自动的 `X-Robots-Tag: noindex` 就完成了别名的归一化。

官方文档：
- https://developers.cloudflare.com/pages/how-to/www-redirect/
- https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/

## 四、首次实站技术验收

在域名能正常访问、生产索引开关开启和最新部署成功后执行：

```bash
npm run audit:live
```

也可以直接在 GitHub 仓库 **Actions → Official domain audit → Run workflow** 手动启动，不要求本机安装 Node.js。该工作流只做远端 HTTP 检查，不会更改 Cloudflare DNS、索引设置或代码。

脚本 `scripts/audit-live.mjs` 不会变更网站或 Cloudflare 设置。它以 HTTPS 请求检查：

- 首发 13 页：HTTP 200、标题/H1、非 noindex、对应自我 canonical。
- 暂缓 13 页：HTTP 200、meta noindex、不出现 canonical。
- `robots.txt` 允许正式站抓取，并指向正式 Sitemap。
- `sitemap.xml` 精确列出 13 个首发 URL。
- Contact 页面显示正式邮箱。
- `www` 和 `random-wheel-58c.pages.dev` 路径/查询保留的 301。

任何不通过项须修复并重跑，不能因为 Pages 显示 Success 就宣称 SEO 验收完成。另需核查至少一次真实手机操作和 HTML 响应中的规范标签。

手动检查：
```bash
curl -I https://numberspinner.com/
curl -I "https://www.numberspinner.com/random-number-wheel/1-3/?test=1"
curl -I "https://random-wheel-58c.pages.dev/random-number-wheel/1-3/?test=1"
curl -I https://numberspinner.com/robots.txt
curl -I https://numberspinner.com/sitemap.xml
```

## 五、Google Search Console

1. 建议添加 `numberspinner.com` **Domain property**，按 GSC 提示添加 DNS TXT 验证记录。
2. 验证成功后提交 `https://numberspinner.com/sitemap.xml`。
3. 使用 URL Inspection 核验首页、`/random-number-wheel/`、`/random-number-wheel/1-3/` 等重要 URL，检查抓取、index/noindex、canonical 和覆盖状态。
4. 正式上线日应记录为首次 HTTPS/301/静态 SEO 验收通过之日，不能拿 Cloudflare 绑定日替代。

## 六、联系邮箱

代码中已显示 `contact@numberspinner.com`，但这**不能证明邮箱可以正常收发邮件**。需要确认实际邮件服务提供方、MX 记录、SPF/DKIM/DMARC（视服务需要），并对外部邮箱发送、接收各测试一次。请勿因接入 Pages 而删除或覆盖现有邮件 DNS 记录。

## 成本与状态边界

该上线方案继续使用 Astro 静态站、Cloudflare Pages、浏览器本地随机数，无需新增数据库、付费 API 或服务器。域名和可能使用的邮箱服务费用应分别核实；不要把“联系邮箱已提供”当作邮件服务必然免费。

**当前已完成：** 代码品牌、联系地址、站点 origin、构建后验收脚本与 SEO 发布门槛。

**当前不可宣称完成：** 正式域名 HTTP/HTTPS 实测、Pages Custom domains Active、301 实测、生产索引开关确已设置、GSC 验证/收录、邮箱收发验证。
