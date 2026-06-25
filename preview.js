// 検証用プレビュー: layout.js のプリミティブを 96dpi の HTML として描画し、
// Chromium でスクリーンショットを撮る。pptx と同一座標・同一テキスト・同一
// フォントサイズ・同一の text inset / 折返し条件で描くため、文字のはみ出し
// および要素の重なりを実機に近い形で確認できる。
const { chromium } = require("playwright");
const { C, SLIDE_W, SLIDE_H, buildElements } = require("./layout");

const DPI = 96;
const PX = (inch) => inch * DPI;
const PT = (pt) => pt * (96 / 72); // pt -> px

// PowerPoint テキストボックスの既定インセット
const INSET_X = 0.1; // inch
const INSET_Y = 0.05; // inch

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textHtml(el) {
  const runsHtml = el.runs
    .map((r) => {
      const style = [
        `font-size:${PT(r.size)}px`,
        `color:#${r.color}`,
        r.bold ? "font-weight:700" : "font-weight:400",
        r.italic ? "font-style:italic" : "",
        r.face === "Cambria" ? "font-family:'Cambria',serif" : "",
      ]
        .filter(Boolean)
        .join(";");
      const br = r.break ? "<br/>" : "";
      return `<span style="${style}">${esc(r.text)}</span>${br}`;
    })
    .join("");

  const justify =
    el.valign === "middle" ? "center" : el.valign === "bottom" ? "flex-end" : "flex-start";
  const textAlign = el.align || "left";
  const boxStyle = [
    "position:absolute",
    `left:${PX(el.x)}px`,
    `top:${PX(el.y)}px`,
    `width:${PX(el.w)}px`,
    `height:${PX(el.h)}px`,
    `padding:${PX(INSET_Y)}px ${PX(INSET_X)}px`,
    "box-sizing:border-box",
    "display:flex",
    "flex-direction:column",
    `justify-content:${justify}`,
    `text-align:${textAlign}`,
    "line-height:1.15",
    "overflow:visible",
    el.fill ? `background:#${el.fill}` : "",
    el.line ? `border:${el.line.width}px solid #${el.line.color}` : "",
    el.radius != null ? `border-radius:${PX(el.radius)}px` : "",
  ]
    .filter(Boolean)
    .join(";");

  // テキスト用の内側ラッパ (align を効かせる)
  return `<div data-kind="box" style="${boxStyle}"><div style="width:100%;text-align:${textAlign}">${runsHtml}</div></div>`;
}

function lineHtml(el) {
  // 水平/垂直線のみ（本レイアウトは直線のみ使用）
  const thick = el.width; // px
  const isH = el.h === 0;
  const left = PX(el.x);
  const top = PX(el.y);
  const len = isH ? PX(el.w) : PX(el.h);
  const style = [
    "position:absolute",
    isH ? `left:${left}px;top:${top - thick / 2}px;width:${len}px;height:${thick}px` : `left:${left - thick / 2}px;top:${top}px;width:${thick}px;height:${len}px`,
    el.dash
      ? `background:repeating-linear-gradient(${isH ? "90deg" : "180deg"},#${el.color} 0 5px,transparent 5px 9px)`
      : `background:#${el.color}`,
  ].join(";");
  let arrows = "";
  // 矢印は重なり判定には影響しないため簡易表現（端に三角）
  return `<div style="${style}"></div>${arrows}`;
}

async function main() {
  const els = buildElements();
  const body = els
    .map((el) => (el.type === "text" ? textHtml(el) : el.type === "line" ? lineHtml(el) : ""))
    .join("\n");

  const html = `<!doctype html><html><head><meta charset="utf-8">
<style>
  * { margin:0; padding:0; }
  html,body { width:${PX(SLIDE_W)}px; height:${PX(SLIDE_H)}px; }
  body { position:relative; background:#${C.cream};
    font-family:'IPAGothic','Noto Sans CJK JP',sans-serif; }
</style></head>
<body>${body}</body></html>`;

  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: Math.round(PX(SLIDE_W)), height: Math.round(PX(SLIDE_H)) },
    deviceScaleFactor: 2,
  });
  await page.setContent(html, { waitUntil: "networkidle" });

  // はみ出し検出: 各テキストボックスについて、内側コンテンツが box 高さ/幅を
  // 超えていないかを scrollHeight/scrollWidth で判定して報告する。
  const overflow = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('[data-kind="box"]').forEach((b, i) => {
      const overH = b.scrollHeight - b.clientHeight;
      const overW = b.scrollWidth - b.clientWidth;
      if (overH > 1 || overW > 1) {
        out.push({ i, text: b.innerText.replace(/\s+/g, " ").slice(0, 40), overW, overH });
      }
    });
    return out;
  });

  await page.screenshot({ path: "preview.png" });
  await browser.close();

  if (overflow.length) {
    console.log("⚠ テキストはみ出し候補:");
    overflow.forEach((o) => console.log(`  [${o.i}] overW=${o.overW} overH=${o.overH} "${o.text}"`));
  } else {
    console.log("✓ テキストボックスのはみ出しは検出されませんでした");
  }
  console.log("preview.png を出力しました");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
