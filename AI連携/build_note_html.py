"""note有料記事の試作(ワークフロー出力JSON)を、読めるHTML成果物に変換する。

使い方:
    python build_note_html.py <入力JSON> <出力HTML>

入力JSONは note-yuryo-kiji-shisaku ワークフローの result(辞書)。
json.load が \\n を実改行に戻すので、Markdownはそのまま正しくレンダリングされる。
"""
import sys
import json
import html
from pathlib import Path

import markdown

MD_EXT = ["tables", "sane_lists", "fenced_code"]


def norm(v):
    """構造化出力でリテラル化した改行(\\n)を実改行に戻す(再帰)。
    ※ \\t はWindowsパス(例 \\teijun)を壊すため置換しない。"""
    if isinstance(v, str):
        return v.replace("\\r\\n", "\n").replace("\\n", "\n")
    if isinstance(v, list):
        return [norm(x) for x in v]
    if isinstance(v, dict):
        return {k: norm(x) for k, x in v.items()}
    return v


def md(text: str) -> str:
    return markdown.markdown(text or "", extensions=MD_EXT)


def ul(items) -> str:
    """メモ類はパス(バックスラッシュ)を壊さないようプレーン描画(HTMLエスケープ+改行)。"""
    lis = "".join(
        f"<li>{html.escape(str(x)).replace(chr(10), '<br>')}</li>" for x in items
    )
    return f"<ul class='notes'>{lis}</ul>"


def main():
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    data = json.loads(src.read_text(encoding="utf-8"))
    r = data["result"] if "result" in data else data
    r = norm(r)

    title = html.escape(r["recommended_title"])
    alt_titles = "".join(f"<li>{html.escape(t)}</li>" for t in r.get("title_options", []))
    tags = "".join(f"<span class='tag'>{html.escape(t)}</span>" for t in r.get("tags", []))

    page = f"""<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>note有料記事 試作 — {title}</title>
<style>
  :root {{ --ink:#1d1d1f; --sub:#6b6b70; --line:#e6e6e9; --bg:#fbfbfc; --accent:#2b6cb0; --pay:#c2410c; --warn:#b45309; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--ink);
    font-family:-apple-system,"Hiragino Kaku Gothic ProN","Meiryo",sans-serif; line-height:1.85; }}
  .wrap {{ max-width:780px; margin:0 auto; padding:32px 20px 80px; }}
  .badge {{ display:inline-block; font-size:12px; font-weight:700; letter-spacing:.04em;
    color:#fff; background:#111; padding:4px 10px; border-radius:6px; }}
  h1.title {{ font-size:27px; line-height:1.5; margin:14px 0 6px; font-weight:800; }}
  .meta {{ display:flex; flex-wrap:wrap; gap:8px 16px; align-items:center;
    color:var(--sub); font-size:13px; margin:10px 0 6px; }}
  .tags {{ margin:10px 0 0; }}
  .tag {{ display:inline-block; font-size:12px; color:var(--accent);
    background:#eef4fb; border-radius:999px; padding:3px 10px; margin:0 6px 6px 0; }}
  .card {{ background:#fff; border:1px solid var(--line); border-radius:14px;
    padding:22px 26px; margin:18px 0; }}
  .card h2.sec {{ font-size:15px; margin:0 0 6px; color:var(--sub); font-weight:700;
    letter-spacing:.03em; text-transform:none; }}
  .article h2 {{ font-size:21px; margin:30px 0 10px; padding-top:6px; border-top:2px solid #f0f0f2; font-weight:800; }}
  .article h3 {{ font-size:17px; margin:22px 0 8px; font-weight:700; }}
  .article p {{ margin:12px 0; }}
  .article ul, .article ol {{ margin:12px 0; padding-left:1.4em; }}
  .article li {{ margin:5px 0; }}
  .article blockquote {{ margin:14px 0; padding:10px 16px; border-left:4px solid #d7dbe0;
    background:#f6f7f9; color:#33363b; border-radius:0 8px 8px 0; }}
  .article table {{ border-collapse:collapse; width:100%; margin:16px 0; font-size:14px; }}
  .article th, .article td {{ border:1px solid var(--line); padding:8px 10px; text-align:left; vertical-align:top; }}
  .article th {{ background:#f4f5f7; font-weight:700; }}
  .article hr {{ border:0; border-top:1px solid var(--line); margin:24px 0; }}
  .article code {{ background:#f0f1f3; padding:1px 6px; border-radius:5px; font-size:.92em; }}
  .free-tag {{ color:#15803d; font-weight:700; }}
  .paywall {{ text-align:center; margin:34px 0 6px; }}
  .paywall .bar {{ display:inline-block; background:var(--pay); color:#fff; font-weight:800;
    padding:8px 22px; border-radius:999px; font-size:14px; letter-spacing:.04em; }}
  .paywall .line {{ margin:14px auto 0; max-width:680px; color:#7a3a12; background:#fff5ee;
    border:1px dashed #f0a878; border-radius:10px; padding:12px 16px; font-size:14px; text-align:left; }}
  .paid-tag {{ color:var(--pay); font-weight:700; }}
  .blanks li {{ color:#7a3a12; }}
  .notes li {{ margin:10px 0; }}
  .price {{ white-space:pre-wrap; font-size:14px; color:#33363b; }}
  .secret {{ background:#fff8f1; border:1px solid #f3c98a; border-radius:10px; padding:12px 16px; margin-top:8px; }}
  .secret b {{ color:var(--warn); }}
  .foot {{ color:var(--sub); font-size:12px; margin-top:30px; text-align:center; }}
</style>
</head>
<body>
<div class="wrap">

  <span class="badge">note 有料記事 ／ 試作（AIが作成）</span>
  <h1 class="title">{title}</h1>
  <div class="meta">
    <span>📝 テーマ：AIで自業務を自動化した実録</span>
    <span>👤 著者：佐藤社長（一次情報）</span>
  </div>
  <div class="tags">{tags}</div>

  <div class="card">
    <h2 class="sec">💴 推奨価格</h2>
    <div class="price">{html.escape(r.get("price_suggestion",""))}</div>
  </div>

  <div class="card">
    <h2 class="sec">🅰️ 別タイトル案</h2>
    <ol>{alt_titles}</ol>
  </div>

  <div class="card article">
    <h2 class="sec"><span class="free-tag">【無料パート】</span> ここまでは誰でも読める（つかみ）</h2>
    {md(r.get("free_section_md",""))}
  </div>

  <div class="paywall">
    <span class="bar">━━ ここから先は有料 ━━</span>
    <div class="line">{md(r.get("paywall_line",""))}</div>
  </div>

  <div class="card article">
    <h2 class="sec"><span class="paid-tag">【有料パート】</span> 購入後に読める本編</h2>
    {md(r.get("paid_section_md",""))}
  </div>

  <div class="card">
    <h2 class="sec">✍️ 社長が埋める箇所（【要・実数】）— 埋まった所から差し替えOK</h2>
    {ul(r.get("fill_in_blanks", []))}
  </div>

  <div class="card">
    <h2 class="sec">🗒️ 編集メモ・投稿手順（社長用）</h2>
    {ul(r.get("editor_notes", []))}
    <div class="secret">⚠️ <b>注意：</b>上の編集メモには社内ファイルの所在や実名が含まれます。<b>note公開時は本文・画像に絶対に出さないでください</b>（本文側は伏字済み）。このHTMLは社内閲覧用です。</div>
  </div>

  <div class="foot">この成果物はAI（Claude）が試作したものです。数字の【要・実数】は盛らず空けています。公開前に固有名詞の伏字と数字をご確認ください。</div>

</div>
</body>
</html>"""
    dst.write_text(page, encoding="utf-8")
    print(f"[OK] generated: {dst}")


if __name__ == "__main__":
    main()
