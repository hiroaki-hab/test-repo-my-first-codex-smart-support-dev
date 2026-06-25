// ビジョン資料の検証プレビュー。各スライドを Chromium で 96dpi 描画し、
// slideNN.png を出力。さらにテキストはみ出しを自動検査して報告する。
// 縦に全スライドを連結した vision_all.png も生成する。
const { chromium } = require("playwright");
const { C } = require("./layout");
const { SLIDE_W, SLIDE_H, buildSlides } = require("./vision_layout");
const { PX, pageHtml } = require("./render");

async function main() {
  const slides = buildSlides();
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: Math.round(PX(SLIDE_W)), height: Math.round(PX(SLIDE_H)) },
    deviceScaleFactor: 2,
  });

  let totalIssues = 0;
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const html = pageHtml(s.els, s.bg || C.cream, SLIDE_W, SLIDE_H);
    await page.setContent(html, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('[data-kind="box"]').forEach((b) => {
        const overH = b.scrollHeight - b.clientHeight;
        const overW = b.scrollWidth - b.clientWidth;
        if (overH > 1 || overW > 1) {
          out.push({ t: b.innerText.replace(/\s+/g, " ").slice(0, 36), overW, overH });
        }
      });
      return out;
    });
    const n = String(i + 1).padStart(2, "0");
    await page.screenshot({ path: `vision_slide${n}.png` });
    if (overflow.length) {
      totalIssues += overflow.length;
      console.log(`⚠ slide ${i + 1}: はみ出し ${overflow.length}件`);
      overflow.forEach((o) => console.log(`    overW=${o.overW} overH=${o.overH} "${o.t}"`));
    } else {
      console.log(`✓ slide ${i + 1}: OK`);
    }
  }

  await browser.close();
  console.log(
    totalIssues === 0
      ? `\n✓ 全${slides.length}枚: テキストはみ出しなし`
      : `\n⚠ 合計 ${totalIssues} 件のはみ出し候補`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
