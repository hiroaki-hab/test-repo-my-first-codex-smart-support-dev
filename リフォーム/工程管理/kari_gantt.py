# -*- coding: utf-8 -*-
"""仮工程JSON → 物件ごとのガント表 PDF/PNG 出力（メール添付用）。

使い方:
    python kari_gantt.py 仮工程_角五郎廣田様_2026-07.json [出力フォルダ]

出力: <出力フォルダ>/<物件名>_仮工程.html / .pdf / .png
社長要望(2026-07-04)「工程表から物件ごとにPDFか画像出力してメールで添付したい」の実装。
シートZには触らず、仮工程JSONから独立生成する（安全・どこでも使える）。
"""
import json
import os
import re
import subprocess
import sys
import datetime

CHROME = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not os.path.exists(CHROME):
    CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

WEEKDAYS = "月火水木金土日"

# 祝日（2026年）— 工程作成ルール(社長指示2026-07-06): 日曜・祝日は稼働日にしない
HOLIDAYS = {
    datetime.date(2026, 1, 1), datetime.date(2026, 1, 12), datetime.date(2026, 2, 11),
    datetime.date(2026, 2, 23), datetime.date(2026, 3, 20), datetime.date(2026, 4, 29),
    datetime.date(2026, 5, 3), datetime.date(2026, 5, 4), datetime.date(2026, 5, 5),
    datetime.date(2026, 5, 6), datetime.date(2026, 7, 20), datetime.date(2026, 8, 11),
    datetime.date(2026, 9, 21), datetime.date(2026, 9, 23), datetime.date(2026, 10, 12),
    datetime.date(2026, 11, 3), datetime.date(2026, 11, 23),
    # お盆休み（社長指示 2026-07-06「お盆中の赤日は休みに」）
    datetime.date(2026, 8, 13), datetime.date(2026, 8, 14), datetime.date(2026, 8, 15),
}


def is_off(dt):
    """休工日（日曜・祝日）。土曜は稼働日"""
    return dt.weekday() == 6 or dt in HOLIDAYS


def parse_date(s):
    m = re.search(r"(\d{4})/(\d{1,2})/(\d{1,2})", s or "")
    if not m:
        return None
    return datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))


def main():
    # --plain: 日祝でバーを切らない「ふつうのバーチャート」表示（社長要望 2026-07-15）
    plain = "--plain" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    src = args[0]
    here = os.path.dirname(os.path.abspath(__file__))
    if not os.path.isabs(src):
        src = os.path.join(here, src)
    outdir = args[1] if len(args) > 1 else os.path.dirname(src)

    d = json.load(open(src, encoding="utf-8"))
    b = d["bukken"]
    rows = d["koutei"]

    dates = [x for k in rows for x in (parse_date(k.get("start")), parse_date(k.get("end"))) if x]
    if not dates:
        sys.exit("[NG] 日付のある工程行がありません")
    d0, d1 = min(dates), max(dates)
    days = [(d0 + datetime.timedelta(days=i)) for i in range((d1 - d0).days + 1)]

    # 日付ヘッダ
    heads = "".join(
        '<th class="d {we}">{m}/{dd}<br><span>{w}</span></th>'.format(
            we=("su" if is_off(dt) else "sa" if dt.weekday() == 5 else ""),
            m=dt.month, dd=dt.day,
            w=("祝" if dt in HOLIDAYS else WEEKDAYS[dt.weekday()]))
        for dt in days)

    body = []
    for k in rows:
        s, e = parse_date(k.get("start")), parse_date(k.get("end"))
        cells = []
        for dt in days:
            we = "su" if is_off(dt) else "sa" if dt.weekday() == 5 else ""
            if plain:
                # ふつうのバーチャート: 開始〜終了を連続バーで表示（日祝でも切らない）
                on = s and e and (s <= dt <= e)
                cls = "pbar" + (" pb-s" if dt == s else "") + (" pb-e" if dt == e else "")
                bar = '<div class="{}"></div>'.format(cls) if on else ""
            else:
                # 日曜・祝日は稼働日でないためバーを塗らない（工程作成ルール2026-07-06）
                on = s and e and (s <= dt <= e) and not is_off(dt)
                bar = '<div class="bar"></div>' if on else ""
            cells.append('<td class="c {we}">{bar}</td>'.format(we=we, bar=bar))
        note = ""
        g = k.get("gyousha", "")
        if "⚠" in g:
            note = ' <span class="warn">' + g[g.index("⚠"):] + "</span>"
            g = g[:g.index("⚠")].strip("（(　 ")
        body.append(
            "<tr><td class='ks'>{ku}</td><td class='sg'>{sa}</td><td class='gy'>{gy}{nt}</td>{cells}</tr>".format(
                ku=k.get("kubun", ""), sa=k.get("sagyou", ""), gy=g, nt=note, cells="".join(cells)))

    # 全期間が1枚に収まる印刷設定（A3横・自動縮小）。右端切れ対策(社長指摘 2026-07-15)
    content_w = 470 + 40 * len(days)
    zoom = min(1.0, round(1500 / content_w, 3))

    html = """<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><style>
 @page {{ size: A3 landscape; margin: 8mm; }}
 @media print {{ body {{ zoom: {zoom}; margin: 6px; }} }}
 body {{ font-family:"Yu Gothic","Meiryo",sans-serif; margin:24px; color:#1a1a1a; background:#fff; }}
 h1 {{ font-size:19px; margin:0 0 2px; }}
 .sub {{ font-size:11.5px; color:#555; margin-bottom:12px; }}
 .badge {{ display:inline-block; background:#e8712a; color:#fff; font-size:11px; padding:2px 10px; border-radius:3px; margin-left:8px; vertical-align:middle; }}
 table {{ border-collapse:collapse; width:100%; }}
 th,td {{ border:1px solid #b9c4cd; font-size:11.5px; padding:4px 6px; }}
 th {{ background:#2f6b9a; color:#fff; font-weight:600; }}
 th.d {{ width:38px; text-align:center; padding:3px 1px; font-size:10.5px; }}
 th.d span {{ font-size:10px; font-weight:normal; }}
 td.ks {{ width:110px; font-weight:600; background:#f2f6f9; }}
 td.sg {{ width:210px; }}
 td.gy {{ width:120px; }}
 td.c {{ position:relative; height:26px; padding:0; }}
 th.sa, td.sa {{ background-color:#fdeade; }}
 th.su, td.su {{ background-color:#fbdccc; }}
 th.d.sa, th.d.su {{ background:#a95c2e; }}
 .bar {{ position:absolute; inset:5px 1px; background:#c6efce; border:1px solid #7fbf8e; border-radius:2px; }}
 .pbar {{ position:absolute; top:5px; bottom:5px; left:-1px; right:-1px; background:#c6efce; border-top:1px solid #7fbf8e; border-bottom:1px solid #7fbf8e; }}
 .pb-s {{ left:1px; border-left:1px solid #7fbf8e; border-radius:3px 0 0 3px; }}
 .pb-e {{ right:1px; border-right:1px solid #7fbf8e; border-radius:0 3px 3px 0; }}
 .warn {{ color:#b9770e; font-size:10px; }}
 .foot {{ margin-top:10px; font-size:11px; color:#666; }}
</style></head><body>
 <h1>{name}　仮工程表<span class="badge">仮・要確認</span></h1>
 <div class="sub">住所：{addr}　／　作成：{today}　有限会社 光和工業　／　出典：{src}</div>
 <table><tr><th>工種</th><th>作業</th><th>担当（仮）</th>{heads}</tr>{body}</table>
 <div class="foot">※ 本工程は仮組みです。日程・担当は変更になる場合があります。{barnote}{note}</div>
</body></html>""".format(
        name=b.get("name", ""), addr=b.get("address", "確認中"),
        today=datetime.date.today().strftime("%Y/%m/%d"),
        src=(d.get("source", "") or "")[:60], heads=heads, body="".join(body),
        barnote=("バーは開始〜終了の期間（日曜・祝日＝薄橙の列は休工）。" if plain
                 else "緑バーは稼働日のみ（日曜・祝日は休工）。"),
        note=(b.get("note", "") or "")[:120], zoom=zoom)

    safe = re.sub(r"[\\/:*?\"<>|（）()]", "", b.get("name", "bukken"))[:20]
    base = os.path.join(outdir, safe + "_仮工程")
    open(base + ".html", "w", encoding="utf-8").write(html)
    url = "file:///" + base.replace("\\", "/") + ".html"
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    "--print-to-pdf=" + base + ".pdf", url], capture_output=True, timeout=60)
    png_w = max(1400, content_w + 60)
    png_h = 260 + len(rows) * 160
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    "--window-size={},{}".format(png_w, png_h), "--screenshot=" + base + ".png", url],
                   capture_output=True, timeout=60)
    for ext in (".html", ".pdf", ".png"):
        p = base + ext
        print(("[OK] " if os.path.exists(p) else "[NG] ") + p)


if __name__ == "__main__":
    main()
