#!/usr/bin/env python3
"""Render static panel mockups for the README (fictional data only)."""
import html
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"
MOCK = DOCS / "mock"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
CSS = (MOCK / "panel.css").read_text()

TOKENS = """
:root{
  --dsw-font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif;
  --dsw-alias-bg-base:#151517;--dsw-alias-bg-layer-1:#232324;--dsw-alias-bg-layer-2:#2c2c2e;--dsw-alias-bg-layer-3:#353638;
  --dsw-alias-border-l1:#ffffff0f;--dsw-alias-border-l2:#ffffff1f;--dsw-alias-border-l3:#ffffff29;--dsw-alias-border-l4:#ffffff3d;
  --dsw-alias-label-primary:#f9fafb;--dsw-alias-label-secondary:#adb2b8;--dsw-alias-label-tertiary:#81858c;--dsw-alias-label-caption:#61666b;
  --dsw-alias-label-primary-foreground:#0f1115;
  --dsw-alias-interactive-bg-hover:#ffffff14;--dsw-alias-interactive-bg-active:#ffffff24;--dsw-alias-interactive-bg-hover-accent:#ffffff3d;
  --dsw-alias-button-primary-fill:#f9fafb;--dsw-alias-button-primary-hover:#ffffff;--dsw-alias-button-contrast-fill:#43454a;
  --dsw-static-deepseek-400:#7aaaff;--dsw-static-deepseek-450:#5686fe;--dsw-static-deepseek-500:#4176e6;--dsw-static-deepseek-600:#4868b2;
  --dsw-static-green-500:#41c977;--dsw-static-green-600:#2f9e5f;--dsw-static-green-700:#2f7d52;
  --dsw-static-amber-500:#f0a33a;--dsw-static-amber-700:#a6600a;
  --dsw-static-red-500:#e5484d;--dsw-static-red-600:#c53b3f;--dsw-static-teal-500:#2aa6a0;
  --dsw-shadow-lv1:0 2px 4px 0 #00000026;--dsw-shadow-lv2:0 4px 12px 0 #00000026,0 2px 8px 0 #0000001f;
  --dsw-shadow-lv3:0 0 1px 0 #0003,0 4px 16px 0 #0000004d,0 16px 48px 0 #0000003d;
  --dsw-radius-sm:8px;--dsw-radius-md:12px;
}
html,body{margin:0;width:1600px;height:1000px;overflow:hidden;background:#0d0f15}
body{font-family:var(--dsw-font-family)}
.dsss-root{height:1000px;background:var(--dsw-alias-bg-base)}
.dsss-wrap{max-width:1320px;padding-top:22px}
"""

def esc(text):
    return html.escape(text, quote=False)

def mark(text):
    return text.replace("[", "<mark class='dsss-mark'>").replace("]", "</mark>")

def chevron():
    return '<span class="dsss-chip-chevron"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="m7 10 5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'

def arrow():
    return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h13m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def search_icon(size=18):
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.4" stroke="currentColor" stroke-width="1.9"/><path d="m15.4 15.4 5.2 5.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M7.7 8.7h5.6M7.7 11.3h3.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".55"/></svg>'

def session_icon():
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4.5 7A3.5 3.5 0 0 1 8 3.5h8A3.5 3.5 0 0 1 19.5 7v6a3.5 3.5 0 0 1-3.5 3.5H9.2L5 20v-3.8A3.5 3.5 0 0 1 4.5 12V7Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.2 8.2h7.6M8.2 11.2h4.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".7"/></svg>'

def copy_icon():
    return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2.4" stroke="currentColor" stroke-width="1.7"/><path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6a3 3 0 0 0-3 3v6.5A2.5 2.5 0 0 0 5.5 15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'

def head(status_bits="就绪", count="42 会话", seg="86,420 段落"):
    return f"""
<header class="dsss-head">
  <div class="dsss-head-copy">
    <h1 class="dsss-title">深海搜索</h1>
    <p class="dsss-subtitle">遍历所有会话，潜到最深处，把那一句捞上来。</p>
  </div>
  <div class="dsss-head-meta">
    <span class="dsss-status{" is-building" if status_bits.startswith("索引") else ""}"><span class="dsss-status-dot"></span>{status_bits}</span>
    <span class="dsss-meta-stat">{count}<span class="dsss-meta-sep">·</span>{seg}</span>
    <button type="button" class="dsss-icon-btn" title="重建索引"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v4.5h-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  </div>
</header>"""

def searchbar(query, regex=False):
    mode_word = " is-on" if not regex else ""
    mode_regex = " is-on" if regex else ""
    return f"""
<div class="dsss-search">
  <span class="dsss-search-icon">{search_icon()}</span>
  <input class="dsss-input" value="{esc(query)}" placeholder="输入关键词，或切到正则…" readonly aria-label="检索">
  <button type="button" class="dsss-clear-btn" title="清空检索词">×</button>
  <div class="dsss-mode"><div class="dsss-seg is-compact">
    <button type="button" class="dsss-seg-btn{mode_word}">关键词</button>
    <button type="button" class="dsss-seg-btn{mode_regex}">正则</button>
  </div></div>
</div>"""

def chip(label, on=False, open_=False):
    cls = "dsss-chip" + (" is-on" if on else "") + (" is-open" if open_ else "")
    return f'<div class="dsss-chipwrap"><button type="button" class="{cls}"><span class="dsss-chip-label">{esc(label)}</span>{chevron()}</button>'

def filters(file_on=False, content_on=False, workspace_on=False, open_menu=None, menu=""):
    out = ['<div class="dsss-filterbar">']
    out.append(chip("位置 · 全部") + "</div>")
    out.append(chip("时间 · 全部") + "</div>")
    out.append(chip("内容 · 全部", content_on, open_menu == "content") + (menu if open_menu == "content" else "") + "</div>")
    out.append(chip("文件类型 · " + ("文档" if file_on else "全部"), file_on, open_menu == "files") + (menu if open_menu == "files" else "") + "</div>")
    out.append(chip("工作空间 · " + ("nova-docs" if workspace_on else "全部"), workspace_on) + "</div>")
    out.append(chip("排序 · 最新") + "</div>")
    out.append('<div class="dsss-chipwrap"><button type="button" class="dsss-chip"><span class="dsss-chip-label">更多</span>' + chevron() + "</button></div>")
    out.append('<span class="dsss-filter-spacer"></span>')
    out.append("</div>")
    return "".join(out)

def file_menu():
    cats = ["文档", "代码", "数据", "配置", "图片", "音视频", "其他"]
    toks = "".join(f'<button type="button" class="dsss-token{" is-on" if c == "文档" else ""}">{c}</button>' for c in cats)
    exts = [".md", ".pdf", ".docx", ".ts", ".yml", ".json"]
    exthtml = "".join(f'<button type="button" class="dsss-ext{" is-on" if e in (".md", ".pdf") else ""}">{e}</button>' for e in exts)
    return f"""
<div class="dsss-menu" style="position:fixed;top:184px;left:483px;width:320px;z-index:9999"><div class="dsss-menu-inner">
  <div class="dsss-menu-title">文件类型<button type="button" class="dsss-menu-link">清空</button></div>
  <div class="dsss-grid">{toks}</div>
  <div class="dsss-menu-caption">扩展名</div>
  <div class="dsss-exts">{exthtml}</div>
  <p class="dsss-menu-hint">命中段落本身引用了该类文件即算；正文/工具调用里的路径也会命中。</p>
</div></div>"""

def content_menu():
    rows = [("正文", True), ("文件", True), ("工具调用", True), ("工具输出", True), ("附件", True), ("摘要", True), ("思考", True)]
    items = "".join(f"""<button type="button" class="dsss-toggle-row"><span class="dsss-toggle-copy"><span class="dsss-toggle-label">{n}</span></span><span class="dsss-switch{' is-on' if v else ''}"><span class="dsss-switch-dot"></span></span></button>""" for n, v in rows)
    return f"""
<div class="dsss-menu" style="position:fixed;top:184px;left:390px;width:252px;z-index:9999"><div class="dsss-menu-inner">
  <div class="dsss-menu-title">内容<button type="button" class="dsss-menu-link">重置</button></div>
  {items}
</div></div>"""

def hit(loc, turn, kind, time, snippet, role, selected=False, file_label=""):
    loc_cls = loc
    selected_cls = " is-selected" if selected else ""
    arrow_btn = f'<button type="button" class="dsss-hit-open" title="打开会话" aria-label="打开会话">{arrow()}</button>'
    file_part = f'<span class="dsss-hit-file">{esc(file_label)}</span>' if file_label else ""
    return f"""
<div class="dsss-hit{selected_cls}" role="button" tabindex="0">
  <span class="dsss-hit-rail dsss-role-{role} dsss-kind-{kind}"></span>
  <span class="dsss-hit-body">
    <span class="dsss-hit-snippet">{mark(snippet)}</span>
    <span class="dsss-hit-meta">
      <span class="dsss-loc dsss-loc-{loc_cls}">{ {'ask':'提问','answer':'回答','execute':'执行','thought':'思考','summary':'摘要','meta':'标题'}[loc_cls] }</span>
      <span class="dsss-hit-turn">第 {turn} 轮</span>
      <span class="dsss-hit-kind">{kind}</span>
      <span class="dsss-hit-count">3 处</span>
      <span class="dsss-hit-time">{time}</span>
      {file_part}
    </span>
  </span>
  {arrow_btn}
</div>"""

def group(title, path, count, time, hits, live=True):
    live_cls = " is-live" if live else ""
    live_badge = '<span class="dsss-live">进行中</span>' if live else ""
    body = "".join(hits)
    return f"""
<section class="dsss-group">
  <div class="dsss-group-head" role="heading" aria-level="2" title="{esc(path)}">
    <span class="dsss-group-mark{live_cls}">{session_icon()}</span>
    <span class="dsss-group-copy">
      <span class="dsss-group-title">{esc(title)}</span>
      <span class="dsss-group-path">{esc(path)}</span>
    </span>
    {live_badge}
    <span class="dsss-group-count">{count}</span>
    <span class="dsss-group-time">{time}</span>
  </div>
  {body}
</section>"""

def preview(loc, kind, title, sub, text, files, selected_file=None):
    chips = "".join(f'<button type="button" class="dsss-filechip"><span class="dsss-filechip-ext">{esc(ext)}</span><span class="dsss-filechip-name">{esc(name)}</span></button>' for ext, name in files)
    return f"""
<aside class="dsss-preview">
  <div class="dsss-preview-head">
    <div class="dsss-preview-badges">
      <span class="dsss-loc dsss-loc-{loc}">{ {'ask':'提问','answer':'回答','execute':'执行','thought':'思考','summary':'摘要','meta':'标题'}[loc] }</span>
      <span class="dsss-badge">{esc(kind)}</span>
    </div>
    <div class="dsss-preview-actions">
      <button type="button" class="dsss-icon-btn" title="复制原文">{copy_icon()}</button>
      <button type="button" class="dsss-btn primary">打开会话 {arrow()}</button>
    </div>
  </div>
  <div class="dsss-preview-meta">
    <span class="dsss-preview-title">{esc(title)}</span>
    <span class="dsss-preview-sub">{esc(sub)}</span>
  </div>
  <div class="dsss-preview-text">{mark(text)}</div>
  <div class="dsss-preview-files"><div class="dsss-menu-caption">文件</div>{chips}</div>
  <div class="dsss-preview-foot"><span>双击或点 → 打开</span><span class="dsss-kbd">→</span></div>
</aside>"""

def footer(scanned="13,204 段落", hits="37 处命中", ms="28 ms", index="64.8 MB 索引"):
    return f"""
<footer class="dsss-foot">
  <span>↑↓ 选择 · 双击 / → 打开 · Esc 返回</span>
  <span class="dsss-foot-stats">{scanned}<span class="dsss-meta-sep">·</span>{hits}<span class="dsss-meta-sep">·</span>{ms}<span class="dsss-meta-sep">·</span>{index}<span class="dsss-build">v1.0.0</span></span>
</footer>"""

def page(name, query, groups_html, preview_html, regex=False, file_on=False, content_on=False, open_menu=None, menu=None, status="就绪", count="42 会话", seg="86,420 段落", footer_html=None, panel_extra="", spacer=""):
    body = f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>{TOKENS}\n{CSS}\nhtml,body{{width:1600px;height:1000px;overflow:hidden}}</style></head>
<body><div class="dsss-root"><div class="dsss-wrap">
{head(status, count, seg)}
{searchbar(query, regex)}
{filters(file_on, content_on, False, open_menu, menu or "")}
<div class="dsss-panel{panel_extra}">
  <div class="dsss-list">
    {spacer}
    {groups_html}
  </div>
  {preview_html}
</div>
{footer_html or footer()}
</div></div></body></html>"""
    path = MOCK / f"{name}.html"
    path.write_text(body)
    png = DOCS / f"{name}.png"
    subprocess.run([
        CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
        "--user-data-dir=/tmp/chrome-deep-search", "--window-size=1600,1000",
        f"--screenshot={png}", f"file://{path}",
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# 1. main
main_groups = group(
    "支付网关灰度迁移", "~/work/payments", 4, "11-12 18:42",
    hit("answer", 43, "正文", "11-12 18:12", "把 [gateway.timeout] 从 8s 调到 15s，先灰度 10% 流量；回调重试 3 → 5 次，观察 30 分钟。", "assistant", True, "config/gateway.yaml")
    + hit("execute", 42, "工具调用", "11-12 18:07", 'grep -R "[timeout]" services/checkout | head -20', "assistant", False, "services/checkout/handler.ts")
    + hit("ask", 42, "正文", "11-12 18:06", "支付回调偶发超时，先在灰度环境复现一下。", "user")
    + hit("execute", 42, "文件", "11-12 18:06", "config/gateway.yaml", "assistant", False, "config/gateway.yaml"),
) + group(
    "Nova 文档站重构", "~/work/nova-docs", 2, "11-12 15:20",
    hit("execute", 18, "工具调用", "11-12 15:18", 'apply_patch docs/migration.md  →  "把旧域名 [migration] 说明里的 14 处链接换掉"', "assistant", False, "docs/migration.md")
    + hit("execute", 18, "文件", "11-12 15:18", "docs/migration.md", "assistant", False, "docs/migration.md"),
) + group(
    "指标看板改版", "~/work/insight", 3, "11-11 21:08",
    hit("thought", 31, "思考", "11-11 21:03", "P95 延迟要拆成读/写两条曲线，否则 [timeout] 和慢查询会混在一起。", "assistant")
    + hit("answer", 31, "正文", "11-11 21:08", "已把 latency 拆成 read / write 两个 series，图例和提示都改好了。", "assistant", False, "src/charts/latency.ts"),
)
main_preview = preview(
    "answer", "正文", "支付网关灰度迁移", "~/work/payments · 11-12 18:12 · 第 43 轮",
    "把 gateway.timeout 从 8s 调到 15s，先灰度 10% 流量。\n\n- 回调重试 3 → 5 次\n- 告警阈值 1.2s，超过 3 分钟持续触发\n- 观察 30 分钟，无异常再放量到 50%\n\n配置文件在 config/gateway.yaml，回滚脚本已留在 deploy/rollback.sh。",
    [(".yaml", "config/gateway.yaml"), (".ts", "services/checkout/handler.ts")],
)
page("shot-main", "超时", main_groups, main_preview)

# 2. file type popover
filter_groups = group(
    "财务归档自动化", "~/work/finance-ops", 8, "11-12 10:24",
    hit("execute", 27, "文件", "11-12 10:22", "invoices/invoice_2041.pdf", "assistant", True, "invoices/invoice_2041.pdf")
    + hit("execute", 27, "工具调用", "11-12 10:21", 'pdfinfo invoices/invoice_2041.pdf | head -12', "assistant", False, "invoices/invoice_2041.pdf")
    + hit("answer", 27, "正文", "11-12 10:24", "2041 那张发票金额 ¥12,480，校验码已写入回执；[PDF] 原件归档在 archive/2026/。", "assistant", False, "invoices/invoice_2041.pdf")
    + hit("execute", 26, "文件", "11-12 10:18", "archive/2026/invoice_2038.pdf", "assistant", False, "archive/2026/invoice_2038.pdf"),
) + group(
    "季度对账脚本", "~/work/finance-ops", 3, "11-11 18:02",
    hit("execute", 12, "工具调用", "11-11 18:00", 'python tools/reconcile.py --period 2026Q3 --out reconcile.pdf', "assistant", False, "reconcile.pdf"),
)
filter_preview = preview(
    "execute", "文件", "财务归档自动化", "~/work/finance-ops · 11-12 10:22 · 第 27 轮",
    "invoices/invoice_2041.pdf",
    [(".pdf", "invoices/invoice_2041.pdf"), (".pdf", "archive/2026/invoice_2038.pdf")],
)
page("shot-filters", "invoice", filter_groups, filter_preview, file_on=True, open_menu="files", menu=file_menu(),
     count="42 会话", seg="86,420 段落", spacer='<div style="height:232px"></div>')

# 3. regex + document filter
regex_groups = group(
    "财务归档自动化", "~/work/finance-ops", 8, "11-12 10:24",
    hit("execute", 27, "文件", "11-12 10:22", "invoices/[invoice_2041.pdf]", "assistant", True, "invoices/invoice_2041.pdf")
    + hit("execute", 27, "工具调用", "11-12 10:21", 'pdfinfo invoices/[invoice_2041.pdf] | head -12', "assistant", False, "invoices/invoice_2041.pdf")
    + hit("answer", 27, "正文", "11-12 10:24", "2041 那张发票金额 ¥12,480，校验码已写入回执；PDF 原件归档在 archive/2026/。", "assistant", False, "invoices/invoice_2041.pdf")
    + hit("execute", 26, "文件", "11-12 10:18", "archive/2026/[invoice_2038.pdf]", "assistant", False, "archive/2026/invoice_2038.pdf"),
) + group(
    "报销单模板整理", "~/work/finance-ops", 2, "11-11 16:40",
    hit("answer", 8, "正文", "11-11 16:40", "把 [invoice_2026.pdf] 系列模板合并成一张，字段按季度变化。", "assistant"),
)
regex_preview = preview(
    "execute", "文件", "财务归档自动化", "~/work/finance-ops · 11-12 10:22 · 第 27 轮",
    "invoices/invoice_2041.pdf",
    [(".pdf", "invoices/invoice_2041.pdf"), (".pdf", "archive/2026/invoice_2038.pdf")],
)
page("shot-regex", r"invoice_\d{4}\.pdf", regex_groups, regex_preview, regex=True, file_on=True)

# 4. content popover + labels
content_groups = group(
    "支付网关灰度迁移", "~/work/payments", 5, "11-12 18:42",
    hit("thought", 43, "推理", "11-12 18:10", "先确认超时是不是连接池耗尽，再看网关自己的 [timeout]。", "assistant", True)
    + hit("ask", 42, "正文", "11-12 18:06", "支付回调偶发超时，先在灰度环境复现一下。", "user")
    + hit("execute", 42, "工具调用", "11-12 18:07", 'grep -R "timeout" services/checkout | head -20', "assistant", False, "services/checkout/handler.ts")
    + hit("answer", 43, "正文", "11-12 18:12", "把 [timeout] 调到 15s，灰度 10%，观察 30 分钟。", "assistant"),
) + group(
    "发布清单", "~/work/meta", 1, "11-11 09:30",
    hit("meta", 0, "会话", "11-11 09:30", "发布前检查：回滚脚本 / 告警阈值 / [超时] 观测面板", "system"),
)
content_preview = preview(
    "thought", "推理", "支付网关灰度迁移", "~/work/payments · 11-12 18:10 · 第 43 轮",
    "先确认超时是不是连接池耗尽，再看网关自己的 timeout。\n\n判断顺序：\n1. 看 p99 连接等待时间\n2. 对照下游 5xx\n3. 最后才动 gateway.timeout\n\n如果只是灰度流量，先别改全局配置。",
    [(".yaml", "config/gateway.yaml")],
)
page("shot-content", "超时", content_groups, content_preview, content_on=True, open_menu="content", menu=content_menu(), spacer='<div style="height:232px"></div>')

print("rendered", [p.name for p in DOCS.glob("shot-*.png")])
