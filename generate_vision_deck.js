// 社員向けビジョン資料「光和工業は、こう変わる。」PowerPoint 生成
// 共有レイアウト(vision_layout.js)と共有描画基盤(render.js)を使用する。
const PptxGenJS = require("pptxgenjs");
const { C } = require("./layout");
const { SLIDE_W, SLIDE_H, buildSlides } = require("./vision_layout");
const { drawElements } = require("./render");

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "WIDE", width: SLIDE_W, height: SLIDE_H });
pptx.layout = "WIDE";

const slides = buildSlides();
for (const s of slides) {
  const slide = pptx.addSlide();
  slide.background = { color: s.bg || C.cream };
  drawElements(pptx, slide, s.els);
}

pptx
  .writeFile({ fileName: "光和工業_ビジョン資料.pptx" })
  .then((fn) => console.log("生成完了:", fn, `(${slides.length}枚)`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
