# -*- coding: utf-8 -*-
"""現場支配シートZ（メイン板）→ 物件ごとの工程表 PDF/PNG 出力。

使い方:
    python genba_pdf.py                    # 全物件を出力
    python genba_pdf.py 苦竹 佐藤巧        # 名前に部分一致する物件だけ出力
    python genba_pdf.py --out <フォルダ>   # 出力先指定（既定: デスクトップ\工程PDF\）

データ源: スマホ工程サイトの JSON API（?json=1）＝シートZの緑バーそのまま。
社長要望(2026-07-07)「物件ごとのPDFを出力したい」の実装。
仮工程JSONから作る kari_gantt.py と違い、こちらは昇格済みメイン板の最新を出す。
"""
import datetime
import json
import os
import re
import subprocess
import sys
import urllib.request

from kari_gantt import CHROME, HOLIDAYS, WEEKDAYS, is_off

EXEC_URL = ("https://script.google.com/macros/s/"
            "AKfycbwAVJMEfNXYjJOa1unhxvNsnm9Nw-0uT1xMdPlteId8sv9OSFE-fZkkn35I6lvhPvjO/exec")
DESKTOP = os.path.join(os.environ["USERPROFILE"], "OneDrive", "デスクトップ")
JST = datetime.timezone(datetime.timedelta(hours=9))


def ms_to_date(ms):
    return datetime.datetime.fromtimestamp(ms / 1000, tz=JST).date()


def fetch_projects():
    with urllib.request.urlopen(EXEC_URL + "?json=1", timeout=90) as r:
        return json.loads(r.read().decode("utf-8"))


def build_html(p, today):
    """1物件分のガントHTML。バーは (作業ラベル, 担当) ごとに1行へまとめる"""
    rows = []   # [label, vendor, [(s,e), ...]]
    for b in p.get("bars", []):
        s, e = ms_to_date(b["s"]), ms_to_date(b["e"])
        key = (b.get("label", ""), b.get("vendor", ""))
        for r in rows:
            if (r[0], r[1]) == key:
                r[2].append((s, e))
                break
        else:
            rows.append([key[0], key[1], [(s, e)]])
    if not rows:
        return None

    d0 = min(s for _, _, rs in rows for s, _ in rs)
    d1 = max(e for _, _, rs in rows for _, e in rs)
    days = [(d0 + datetime.timedelta(days=i)) for i in range((d1 - d0).days + 1)]

    heads = "".join(
        '<th class="d {we}">{m}/{dd}<br><span>{w}</span></th>'.format(
            we=("su" if is_off(dt) else "sa" if dt.weekday() == 5 else ""),
            m=dt.month, dd=dt.day,
            w=("祝" if dt in HOLIDAYS else WEEKDAYS[dt.weekday()]))
        for dt in days)

    trs = []
    for label, vendor, ranges in rows:
        cells = []
        for dt in days:
            on = any(s <= dt <= e for s, e in ranges)
            we = "su" if is_off(dt) else "sa" if dt.weekday() == 5 else ""
            cells.append('<td class="c {we}">{bar}</td>'.format(
                we=we, bar='<div class="bar"></div>' if on else ""))
        trs.append("<tr><td class='sg'>{sa}</td><td class='gy'>{gy}</td>{cells}</tr>".format(
            sa=label, gy=vendor, cells="".join(cells)))

    tmark = ""
    if d0 <= today <= d1:
        tmark = "（本日 {m}/{d}）".format(m=today.month, d=today.day)

    bikou = (p.get("bikou") or "").replace("\n", "　")[:160]
    return """<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><style>
 body {{ font-family:"Yu Gothic","Meiryo",sans-serif; margin:24px; color:#1a1a1a; background:#fff; }}
 h1 {{ font-size:19px; margin:0 0 2px; }}
 .sub {{ font-size:11.5px; color:#555; margin-bottom:12px; }}
 table {{ border-collapse:collapse; width:100%; }}
 th,td {{ border:1px solid #b9c4cd; font-size:11.5px; padding:4px 6px; }}
 th {{ background:#2f6b9a; color:#fff; font-weight:600; }}
 th.d {{ width:52px; text-align:center; padding:3px 2px; }}
 th.d span {{ font-size:10px; font-weight:normal; }}
 td.sg {{ width:230px; }}
 td.gy {{ width:130px; }}
 td.c {{ position:relative; height:26px; padding:0; }}
 th.sa, td.sa {{ background-color:#fdeade; }}
 th.su, td.su {{ background-color:#fbdccc; }}
 th.d.sa, th.d.su {{ background:#a95c2e; }}
 .bar {{ position:absolute; inset:5px 1px; background:#c6efce; border:1px solid #7fbf8e; border-radius:2px; }}
 .bikou {{ margin:0 0 10px; background:#fdeee3; border:1px solid #f3d3ba; border-radius:6px; padding:7px 10px; font-size:11.5px; }}
 .foot {{ margin-top:10px; font-size:11px; color:#666; }}
</style></head><body>
 <h1>{name}　工程表</h1>
 <div class="sub">住所：{addr}　／　作成：{today} {tmark}　有限会社 光和工業（現場支配シートZより自動出力）</div>
 {bikou_div}
 <table><tr><th>作業</th><th>担当</th>{heads}</tr>{body}</table>
 <div class="foot">※ 日程は変更になる場合があります。最新はオンライン工程表をご確認ください。</div>
</body></html>""".format(
        name=p.get("name", ""), addr=p.get("addr", "確認中"),
        today=today.strftime("%Y/%m/%d"), tmark=tmark,
        bikou_div=('<div class="bikou">' + bikou + "</div>") if bikou else "",
        heads=heads, body="".join(trs))


def main():
    args = [a for a in sys.argv[1:]]
    outdir = os.path.join(DESKTOP, "工程PDF")
    if "--out" in args:
        i = args.index("--out")
        outdir = args[i + 1]
        del args[i:i + 2]
    os.makedirs(outdir, exist_ok=True)

    today = datetime.datetime.now(JST).date()
    stamp = today.strftime("%Y%m%d")
    projects = fetch_projects()
    if args:
        projects = [p for p in projects if any(a in p.get("name", "") for a in args)]
    if not projects:
        sys.exit("[NG] 該当物件なし: " + " ".join(args))

    for p in projects:
        html = build_html(p, today)
        if html is None:
            print("[SKIP] バーなし: " + p.get("name", ""))
            continue
        safe = re.sub(r"[\\/:*?\"<>|（）()　 ]", "", p.get("name", "bukken"))[:20]
        base = os.path.join(outdir, safe + "_工程表_" + stamp)
        open(base + ".html", "w", encoding="utf-8").write(html)
        url = "file:///" + base.replace("\\", "/") + ".html"
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                        "--print-to-pdf=" + base + ".pdf", url], capture_output=True, timeout=60)
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                        "--window-size=1500,600", "--screenshot=" + base + ".png", url],
                       capture_output=True, timeout=60)
        ok = all(os.path.exists(base + ext) for ext in (".pdf", ".png"))
        print(("[OK] " if ok else "[NG] ") + base + ".pdf")


if __name__ == "__main__":
    main()
