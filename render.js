// 共有レンダリング基盤
// プリミティブ(rect/text/line) を (1) pptxgenjs スライド と (2) 検証用 HTML の
// 両方へ描画する。vision の生成スクリプトとプレビューが本モジュールを共有する
// ことで、検証結果が実際の pptx と一致することを保証する。

const DPI = 96;
const PX = (inch) => inch * DPI;
const PT = (pt) => pt * (96 / 72);
const INSET_X = 0.1; // inch (PowerPoint 既定インセット)
const INSET_Y = 0.05;

// ---------- pptxgenjs への描画 ----------
function drawElements(pptx, slide, els) {
  for (const el of els) {
    if (el.type === "text") {
      const runs = el.runs.map((r) => ({
        text: r.text,
        options: {
          bold: !!r.bold,
          italic: !!r.italic,
          fontSize: r.size,
          color: r.color,
          ...(r.face ? { fontFace: r.face } : {}),
          ...(r.break ? { breakLine: true } : {}),
          ...(r.bullet ? { bullet: r.bullet } : {}),
        },
      }));
      const opts = {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        align: el.align || "left",
        valign: el.valign || "top",
        ...(el.lineSpacingMultiple ? { lineSpacingMultiple: el.lineSpacingMultiple } : {}),
        ...(el.paraSpaceAfter ? { paraSpaceAfter: el.paraSpaceAfter } : {}),
      };
      if (el.fill) {
        opts.fill = { color: el.fill };
        opts.shape = pptx.ShapeType.roundRect;
        if (el.radius != null) opts.rectRadius = el.radius;
      }
      if (el.line) {
        opts.line = { color: el.line.color, width: el.line.width };
        opts.shape = pptx.ShapeType.roundRect;
        if (el.radius != null) opts.rectRadius = el.radius;
      }
      slide.addText(runs, opts);
    } else if (el.type === "rect") {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        fill: el.fill ? { color: el.fill } : { type: "none" },
        line: el.line ? { color: el.line.color, width: el.line.width } : { type: "none" },
        rectRadius: el.radius != null ? el.radius : 0,
      });
    } else if (el.type === "line") {
      slide.addShape(pptx.ShapeType.line, {
        x: el.x,
        y: el.y,
        w: el.w,
        h: el.h,
        line: {
          color: el.color,
          width: el.width,
          ...(el.dash ? { dashType: "dash" } : {}),
          ...(el.beginArrow ? { beginArrowType: "triangle" } : {}),
          ...(el.endArrow ? { endArrowType: "triangle" } : {}),
        },
      });
    }
  }
}

// ---------- HTML への描画 ----------
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
      const prefix = r.bullet ? "・" : "";
      const br = r.break ? "<br/>" : "";
      return `<span style="${style}">${prefix}${esc(r.text)}</span>${br}`;
    })
    .join("");

  const justify =
    el.valign === "middle" ? "center" : el.valign === "bottom" ? "flex-end" : "flex-start";
  const textAlign = el.align || "left";
  const lh = el.lineSpacingMultiple ? 1.15 * el.lineSpacingMultiple : 1.2;
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
    `line-height:${lh}`,
    el.fill ? `background:#${el.fill}` : "",
    el.line ? `border:${el.line.width}px solid #${el.line.color}` : "",
    el.radius != null ? `border-radius:${PX(el.radius)}px` : "",
  ]
    .filter(Boolean)
    .join(";");
  return `<div data-kind="box" style="${boxStyle}"><div style="width:100%;text-align:${textAlign}">${runsHtml}</div></div>`;
}

function rectHtml(el) {
  const style = [
    "position:absolute",
    `left:${PX(el.x)}px`,
    `top:${PX(el.y)}px`,
    `width:${PX(el.w)}px`,
    `height:${PX(el.h)}px`,
    "box-sizing:border-box",
    el.fill ? `background:#${el.fill}` : "",
    el.line ? `border:${el.line.width}px solid #${el.line.color}` : "",
    el.radius != null ? `border-radius:${PX(el.radius)}px` : "",
  ]
    .filter(Boolean)
    .join(";");
  return `<div style="${style}"></div>`;
}

function lineHtml(el) {
  const thick = el.width;
  const isH = el.h === 0;
  const left = PX(el.x);
  const top = PX(el.y);
  const len = isH ? PX(el.w) : PX(el.h);
  const style = [
    "position:absolute",
    isH
      ? `left:${left}px;top:${top - thick / 2}px;width:${len}px;height:${thick}px`
      : `left:${left - thick / 2}px;top:${top}px;width:${thick}px;height:${len}px`,
    el.dash
      ? `background:repeating-linear-gradient(${isH ? "90deg" : "180deg"},#${el.color} 0 5px,transparent 5px 9px)`
      : `background:#${el.color}`,
  ].join(";");
  return `<div style="${style}"></div>`;
}

function elementToHtml(el) {
  if (el.type === "text") return textHtml(el);
  if (el.type === "rect") return rectHtml(el);
  if (el.type === "line") return lineHtml(el);
  return "";
}

function pageHtml(els, bg, slideW, slideH) {
  const body = els.map(elementToHtml).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;}
    html,body{width:${PX(slideW)}px;height:${PX(slideH)}px;}
    body{position:relative;background:#${bg};
      font-family:'IPAGothic','Noto Sans CJK JP',sans-serif;}
  </style></head><body>${body}</body></html>`;
}

module.exports = { DPI, PX, PT, drawElements, elementToHtml, pageHtml };
