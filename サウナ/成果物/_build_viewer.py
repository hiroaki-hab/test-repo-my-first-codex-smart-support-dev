# -*- coding: utf-8 -*-
"""
成果物ビューア生成スクリプト（光和工業・部長作）2026-06-04
- このフォルダ(サウナ/成果物/)内の *.md を全部読み、1枚の自己完結HTMLに焼き込む。
- 目次サイドバー＋全文検索＋整形表示（表・コードブロック対応）。
- file:// でダブルクリックしても動く（mdを外部fetchしない＝中身を埋め込む）。
使い方:
  python _build_viewer.py        … 成果物ビューア.html を生成
  python _build_viewer.py --open … 生成して既定ブラウザで開く
  ※ 成果物を増やしたら「成果物ビューアを更新.bat」をダブルクリックでOK。
"""
import os, sys, json, glob, urllib.request, datetime

BASE = os.path.dirname(os.path.abspath(__file__))          # サウナ/成果物/
ASSETS = os.path.join(BASE, ".viewer")
os.makedirs(ASSETS, exist_ok=True)
MARKED_PATH = os.path.join(ASSETS, "marked.min.js")
OUT = os.path.join(BASE, "成果物ビューア.html")

# --- marked.js（Markdown→HTML変換ライブラリ）を取得してキャッシュ ---
marked_js = None
if os.path.exists(MARKED_PATH):
    with open(MARKED_PATH, "r", encoding="utf-8") as f:
        marked_js = f.read()
else:
    try:
        url = "https://cdn.jsdelivr.net/npm/marked@12/marked.min.js"
        req = urllib.request.Request(url, headers={"User-Agent": "kowa-viewer"})
        with urllib.request.urlopen(req, timeout=25) as r:
            marked_js = r.read().decode("utf-8")
        with open(MARKED_PATH, "w", encoding="utf-8") as f:
            f.write(marked_js)
        print("marked.js を取得・キャッシュしました")
    except Exception as e:
        print("[警告] marked.js を取得できませんでした（簡易表示にフォールバック）:", e)
        marked_js = None

# --- 成果物 md を収集 ---
CAT = [("構想_", "構想"), ("施策_", "施策"), ("提案_", "提案"), ("分析_", "分析"),
       ("検討_", "検討"), ("SNS_", "SNS"), ("アイデア会議録", "会議録"),
       ("下書き_", "下書き"), ("台帳_", "台帳")]

def category(name):
    for p, c in CAT:
        if name.startswith(p):
            return c
    return "その他"

def title_of(text, fallback):
    for line in text.splitlines():
        s = line.strip()
        if s.startswith("# "):
            return s[2:].strip()
    return fallback

items = []
for fp in sorted(glob.glob(os.path.join(BASE, "*.md"))):
    name = os.path.basename(fp)
    with open(fp, "r", encoding="utf-8-sig") as f:
        txt = f.read()
    items.append({"file": name, "cat": category(name),
                  "title": title_of(txt, name), "md": txt})

order = {c: i for i, (_, c) in enumerate(CAT)}
order["その他"] = 99
items.sort(key=lambda x: (order.get(x["cat"], 98), x["file"]))

# JSON を <script> に安全に埋め込む（</ を分割）
payload = json.dumps(items, ensure_ascii=False).replace("</", "<\\/")
marked_block = "<script>%s</script>" % marked_js if marked_js else ""
today = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

TEMPLATE = r"""<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>光和グループ 成果物ビューア</title>
__MARKED__
<style>
:root{ --bg:#ffffff; --side:#0f172a; --sideink:#e2e8f0; --ink:#1f2933; --line:#e5e7eb; --accent:#0ea5e9; --muted:#64748b; }
*{ box-sizing:border-box; }
body{ margin:0; font-family:"Segoe UI","Hiragino Kaku Gothic ProN","Meiryo",sans-serif; color:var(--ink); background:#f1f5f9; }
#layout{ display:flex; min-height:100vh; }
#side{ width:300px; background:var(--side); color:var(--sideink); position:sticky; top:0; height:100vh; overflow:auto; padding:18px 14px; flex:0 0 300px; }
#side h1{ font-size:16px; margin:0 0 4px; }
#side .sub{ font-size:11px; color:#94a3b8; margin-bottom:14px; }
#q{ width:100%; padding:9px 11px; border-radius:8px; border:1px solid #334155; background:#1e293b; color:#fff; font-size:13px; margin-bottom:6px; }
#count{ font-size:11px; color:#94a3b8; margin-bottom:12px; }
.navcat{ font-size:11px; letter-spacing:.08em; color:#7dd3fc; margin:14px 0 4px; text-transform:uppercase; font-weight:700; }
a.navlink{ display:block; color:var(--sideink); text-decoration:none; font-size:13px; padding:6px 8px; border-radius:6px; line-height:1.4; }
a.navlink:hover{ background:#1e293b; }
#main{ flex:1; padding:28px 32px 80px; max-width:980px; }
.card{ background:var(--bg); border:1px solid var(--line); border-radius:12px; padding:22px 28px; margin:0 0 26px; box-shadow:0 1px 3px rgba(0,0,0,.05); scroll-margin-top:18px; }
.cardhead{ display:flex; align-items:center; gap:10px; margin:-6px 0 10px; padding-bottom:10px; border-bottom:1px dashed var(--line); }
.badge{ background:var(--accent); color:#fff; font-size:11px; font-weight:700; padding:3px 9px; border-radius:999px; }
.fname{ font-size:11px; color:var(--muted); font-family:Consolas,monospace; }
.md{ line-height:1.75; font-size:14.5px; word-wrap:break-word; }
.md h1{ font-size:22px; border-bottom:2px solid var(--line); padding-bottom:6px; margin-top:4px; }
.md h2{ font-size:18px; border-bottom:1px solid var(--line); padding-bottom:4px; margin-top:26px; }
.md h3{ font-size:15.5px; margin-top:20px; }
.md table{ border-collapse:collapse; width:100%; margin:14px 0; font-size:13px; }
.md th,.md td{ border:1px solid #d1d5db; padding:7px 10px; text-align:left; vertical-align:top; }
.md th{ background:#f1f5f9; }
.md tr:nth-child(even) td{ background:#f8fafc; }
.md code{ background:#eef2f7; padding:2px 5px; border-radius:4px; font-family:Consolas,monospace; font-size:12.5px; }
.md pre{ background:#0f172a; color:#e2e8f0; padding:14px; border-radius:8px; overflow:auto; }
.md pre code{ background:none; color:inherit; padding:0; }
.md blockquote{ border-left:4px solid var(--accent); margin:12px 0; padding:4px 14px; color:#475569; background:#f8fafc; }
.md a{ color:var(--accent); }
.md ul,.md ol{ padding-left:22px; }
.md img{ max-width:100%; }
#empty{ color:var(--muted); padding:40px; text-align:center; display:none; }
@media (max-width:820px){
  #layout{ flex-direction:column; }
  #side{ width:100%; height:auto; position:static; flex:none; }
  #main{ padding:18px; }
}
</style>
</head>
<body>
<div id="layout">
  <nav id="side">
    <h1>📁 成果物ビューア</h1>
    <div class="sub">光和グループ AIチーム / 生成 __TODAY__</div>
    <input id="q" type="search" placeholder="🔍 全文検索（例: 補助金, アイスバス）">
    <div id="count"></div>
    <div id="navlist"></div>
  </nav>
  <main id="main"><div id="empty">該当する成果物がありません</div></main>
</div>
<script>
const ITEMS = __PAYLOAD__;
const hasMarked = (typeof marked !== "undefined");
const main = document.getElementById("main");
const nav  = document.getElementById("navlist");
const empty= document.getElementById("empty");

function build(){
  let cur = null;
  ITEMS.forEach((it, i) => {
    if(it.cat !== cur){ cur = it.cat;
      const h=document.createElement("div"); h.className="navcat"; h.textContent=it.cat; nav.appendChild(h); }
    const a=document.createElement("a"); a.className="navlink"; a.href="#a"+i; a.textContent=it.title; a.dataset.idx=i; nav.appendChild(a);

    const sec=document.createElement("section"); sec.className="card"; sec.id="a"+i;
    const head=document.createElement("div"); head.className="cardhead";
    head.innerHTML='<span class="badge"></span><span class="fname"></span>';
    head.querySelector(".badge").textContent=it.cat;
    head.querySelector(".fname").textContent=it.file;
    sec.appendChild(head);
    const body=document.createElement("div"); body.className="md";
    if(hasMarked){ body.innerHTML = marked.parse(it.md); }
    else { const pre=document.createElement("pre"); pre.textContent=it.md; body.appendChild(pre); }
    sec.appendChild(body);
    main.appendChild(sec);
  });
}
function doSearch(q){
  q=q.trim().toLowerCase();
  const cards=document.querySelectorAll("section.card");
  const links=document.querySelectorAll(".navlink");
  let shown=0;
  cards.forEach(s=>{ const hit = q==="" || s.textContent.toLowerCase().indexOf(q)>=0;
    s.style.display = hit ? "" : "none"; if(hit) shown++; });
  links.forEach(l=>{ const s=document.getElementById("a"+l.dataset.idx);
    l.style.display = (s && s.style.display==="none") ? "none" : ""; });
  empty.style.display = shown ? "none" : "block";
}
build();
document.getElementById("count").textContent = ITEMS.length + " 件の成果物";
document.getElementById("q").addEventListener("input", e=>doSearch(e.target.value));
</script>
</body>
</html>
"""

html = (TEMPLATE
        .replace("__MARKED__", marked_block)
        .replace("__PAYLOAD__", payload)
        .replace("__TODAY__", today))

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)
print("OK 生成:", OUT)
print("   収録:", len(items), "件 /", round(len(html)/1024), "KB",
      "/ marked:", "あり" if marked_js else "なし(簡易表示)")

if "--open" in sys.argv:
    try:
        os.startfile(OUT)
    except Exception as e:
        print("自動オープン失敗:", e)
