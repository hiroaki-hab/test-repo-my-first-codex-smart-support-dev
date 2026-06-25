// 有限会社 光和工業 組織図 PowerPoint 生成スクリプト
// pptxgenjs を使用。共有レイアウトモデル(layout.js)からプリミティブを描画する。
const PptxGenJS = require("pptxgenjs");
const { C, SLIDE_W, SLIDE_H, buildElements } = require("./layout");

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "WIDE", width: SLIDE_W, height: SLIDE_H });
pptx.layout = "WIDE";

const slide = pptx.addSlide();
slide.background = { color: C.cream };

const els = buildElements();

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
      },
    }));

    const opts = {
      x: el.x,
      y: el.y,
      w: el.w,
      h: el.h,
      align: el.align || "left",
      valign: el.valign || "top",
    };
    if (el.fill) {
      opts.fill = { color: el.fill };
      opts.shape = pptx.ShapeType.roundRect;
      if (el.radius != null) opts.rectRadius = el.radius;
    }
    if (el.line) {
      opts.line = { color: el.line.color, width: el.line.width };
      // 枠線付きの白カードも角丸で描画
      opts.shape = pptx.ShapeType.roundRect;
      if (el.radius != null) opts.rectRadius = el.radius;
    }

    slide.addText(runs, opts);
  } else if (el.type === "line") {
    const line = {
      color: el.color,
      width: el.width,
      ...(el.dash ? { dashType: "dash" } : {}),
      ...(el.beginArrow ? { beginArrowType: "triangle" } : {}),
      ...(el.endArrow ? { endArrowType: "triangle" } : {}),
    };
    slide.addShape(pptx.ShapeType.line, {
      x: el.x,
      y: el.y,
      w: el.w,
      h: el.h,
      line,
    });
  }
}

pptx
  .writeFile({ fileName: "光和工業_組織図.pptx" })
  .then((fn) => console.log("生成完了:", fn))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
