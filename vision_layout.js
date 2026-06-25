// 社員向けビジョン資料「光和工業は、こう変わる。」レイアウト定義
// 全スライドをプリミティブ(rect/text/line)の配列として定義する。
// 配色は組織図(layout.js)と共通の Forest & Moss 系。
const { C } = require("./layout");

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// ===== 共通パーツ =====
// 各スライド共通の枠（背景・左アクセントバー・キッカー・タイトル・ページ番号）
function frame(kicker, title, pageNo, opts = {}) {
  const els = [];
  // 左上アクセントバー
  els.push({ type: "rect", x: 0.55, y: 0.62, w: 0.14, h: 0.78, fill: C.green, radius: 0.04 });
  // キッカー（小見出し）
  els.push({
    type: "text",
    x: 0.85,
    y: 0.58,
    w: 11.5,
    h: 0.34,
    align: "left",
    valign: "middle",
    runs: [{ text: kicker, size: 13, bold: true, color: C.laundry }],
  });
  // タイトル
  els.push({
    type: "text",
    x: 0.82,
    y: 0.92,
    w: 11.8,
    h: 0.7,
    align: "left",
    valign: "middle",
    runs: [{ text: title, size: 27, bold: true, color: opts.titleColor || C.green }],
  });
  // 下線
  els.push({ type: "line", x: 0.85, y: 1.72, w: 11.6, h: 0, color: "D8D8D2", width: 1.5 });
  // ページ番号
  els.push({
    type: "text",
    x: 12.2,
    y: 6.98,
    w: 0.9,
    h: 0.34,
    align: "right",
    valign: "middle",
    runs: [{ text: String(pageNo), size: 11, color: C.gray }],
  });
  return els;
}

// 箇条書きブロック
function bullets(x, y, w, items, opts = {}) {
  const size = opts.size || 16;
  const gap = opts.gap || 0.86;
  const color = opts.color || C.slate;
  return items.map((it, i) => ({
    type: "text",
    x,
    y: y + i * gap,
    w,
    h: opts.itemH || 0.8,
    align: "left",
    valign: "top",
    lineSpacingMultiple: 1.0,
    runs: [
      { text: "● ", size: size - 2, bold: true, color: opts.markColor || C.green },
      { text: it.head, size, bold: true, color, ...(it.sub ? { break: true } : {}) },
      ...(it.sub ? [{ text: it.sub, size: size - 3.5, color: C.gray }] : []),
    ],
  }));
}

// ===== スライド群 =====
function buildSlides() {
  const slides = [];

  // --- 1. 表紙 ---
  {
    const els = [];
    // 背景の帯
    els.push({ type: "rect", x: 0, y: 0, w: SLIDE_W, h: 2.55, fill: C.green });
    els.push({ type: "rect", x: 0, y: 2.55, w: SLIDE_W, h: 0.12, fill: C.laundry });
    els.push({
      type: "text",
      x: 1.0,
      y: 0.85,
      w: 11.3,
      h: 0.5,
      align: "left",
      valign: "middle",
      runs: [{ text: "社員のみなさんへ ／ 2026年8月 新体制から、その先へ", size: 15, bold: true, color: "CFE3CF" }],
    });
    els.push({
      type: "text",
      x: 0.95,
      y: 1.35,
      w: 11.5,
      h: 1.0,
      align: "left",
      valign: "middle",
      runs: [{ text: "光和工業は、こう変わる。", size: 46, bold: true, color: C.white }],
    });
    els.push({
      type: "text",
      x: 1.0,
      y: 3.2,
      w: 11.5,
      h: 1.1,
      align: "left",
      valign: "middle",
      lineSpacingMultiple: 1.05,
      runs: [
        { text: "住まいを直す会社から、", size: 26, bold: true, color: C.green, break: true },
        { text: "“暮らしと健康”をつくる会社へ。", size: 26, bold: true, color: C.slate },
      ],
    });
    // 5事業のミニチップ
    const chips = [
      { t: "積水ハウス不動産", c: C.sekisui },
      { t: "ランドリー moco", c: C.laundry },
      { t: "KÖWA SAUNA", c: C.sauna },
      { t: "ウェルネス", c: C.wellness },
      { t: "飲食（カフェ）", c: C.food },
    ];
    let cx = 1.0;
    chips.forEach((ch) => {
      const w = 2.15;
      els.push({
        type: "text",
        x: cx,
        y: 5.0,
        w,
        h: 0.55,
        fill: C.white,
        line: { color: ch.c, width: 1.5 },
        radius: 0.1,
        align: "center",
        valign: "middle",
        runs: [{ text: ch.t, size: 12, bold: true, color: ch.c }],
      });
      cx += w + 0.18;
    });
    els.push({
      type: "text",
      x: 1.0,
      y: 6.7,
      w: 11.3,
      h: 0.45,
      align: "left",
      valign: "middle",
      runs: [
        { text: "有限会社 光和工業（宮城県黒川郡大和町・1998年創業）", size: 12, color: C.gray },
      ],
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 2. これまでの私たち ---
  {
    const els = frame("これまでの私たち", "リフォーム屋として、25年で積み上げてきたもの。", 2);
    els.push(
      ...bullets(1.0, 2.15, 7.0, [
        { head: "1998年、大和町で創業。", sub: "積水ハウス不動産の原状回復・リノベを支えるリフォーム屋として。" },
        { head: "培ったのは「空間を直す技術」。", sub: "退去・原状回復・アフター・定期巡回 ― 現場の段取り力と確かな手仕事。" },
        { head: "そして何より、信頼。", sub: "任せてもらえる関係を、一件ずつ積み重ねてきた。" },
      ])
    );
    // 右側メッセージカード
    els.push({
      type: "text",
      x: 8.4,
      y: 2.15,
      w: 4.1,
      h: 2.55,
      fill: C.green,
      radius: 0.12,
      align: "left",
      valign: "middle",
      lineSpacingMultiple: 1.05,
      runs: [
        { text: "この「土台」は、消えない。", size: 18, bold: true, color: C.white, break: true },
        { text: " ", size: 8, color: C.white, break: true },
        { text: "これから始まるすべての新しい事業は、この技術と信頼の上に建っています。", size: 13.5, color: "E6F0E6" },
      ],
    });
    els.push({
      type: "text",
      x: 1.0,
      y: 5.4,
      w: 11.3,
      h: 1.0,
      align: "left",
      valign: "top",
      lineSpacingMultiple: 1.1,
      runs: [
        { text: "変わるのは「やること」が増えること。変わらないのは、ものづくりへの誠実さ。", size: 15, italic: true, color: C.slate },
      ],
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 3. なぜ、いま変わるのか ---
  {
    const els = frame("なぜ、いま変わるのか", "世の中が変わっている。だから私たちも動く。", 3);
    const cards = [
      {
        c: C.slate,
        t: "地方は、人口減と担い手不足",
        b: "単一の下請けだけでは、会社の未来が「一社の事情」に左右されてしまう。事業の柱を増やすことは、みんなの雇用を守ること。",
      },
      {
        c: C.wellness,
        t: "時代は「健康・ととのう」へ",
        b: "サウナ・睡眠・健康経営は、いま社会全体が求めている価値。私たちの強みを活かせる大きな波が来ている。",
      },
      {
        c: C.food,
        t: "技術と人を、もっと広い世界へ",
        b: "「空間を直す力」と現場の人材は、住まいの外でも通用する。眠らせておくのはもったいない。",
      },
    ];
    const cw = 3.75;
    let x = 1.0;
    cards.forEach((cd) => {
      els.push({
        type: "text",
        x,
        y: 2.2,
        w: cw,
        h: 0.85,
        fill: cd.c,
        radius: 0.1,
        align: "center",
        valign: "middle",
        lineSpacingMultiple: 1.0,
        runs: [{ text: cd.t, size: 15, bold: true, color: C.white }],
      });
      els.push({
        type: "text",
        x,
        y: 3.2,
        w: cw,
        h: 2.6,
        fill: C.white,
        line: { color: "E0E0DA", width: 1 },
        radius: 0.1,
        align: "left",
        valign: "top",
        lineSpacingMultiple: 1.1,
        runs: [{ text: cd.b, size: 13.5, color: C.slate }],
      });
      x += cw + 0.33;
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 4. 新しい私たちの姿（5事業） ---
  {
    const els = frame("新しい私たちの姿", "5つの事業で、暮らしを多面的に支える。", 4);
    const biz = [
      { c: C.sekisui, t: "積水ハウス不動産", s: "退去・原状回復・リノベ", d: "本業。すべての土台。" },
      { c: C.laundry, t: "ランドリー moco", s: "コインランドリー＋穀物乾燥機組立", d: "地域の日常と産業を支える。" },
      { c: C.sauna, t: "KÖWA SAUNA", s: "完全貸切プライベートサウナ", d: "リフォーム屋が本気で作る“ととのう”。" },
      { c: C.wellness, t: "ウェルネス", s: "健康経営コンサル／保険・睡眠", d: "人の健康そのものを支える。" },
      { c: C.food, t: "飲食（カフェ）", s: "アニマルフレンドリーカフェ", d: "地域が集う場と、社会貢献。" },
    ];
    const cw = 2.25;
    let x = 0.78;
    biz.forEach((b) => {
      els.push({
        type: "text",
        x,
        y: 2.25,
        w: cw,
        h: 0.95,
        fill: b.c,
        radius: 0.1,
        align: "center",
        valign: "middle",
        lineSpacingMultiple: 0.98,
        runs: [
          { text: b.t, size: 13, bold: true, color: C.white, break: true },
          { text: b.s, size: 8.5, color: "F2F2F2" },
        ],
      });
      els.push({
        type: "text",
        x,
        y: 3.35,
        w: cw,
        h: 1.5,
        fill: C.white,
        line: { color: b.c, width: 1 },
        radius: 0.1,
        align: "left",
        valign: "top",
        lineSpacingMultiple: 1.08,
        runs: [{ text: b.d, size: 12, color: C.slate }],
      });
      x += cw + 0.2;
    });
    els.push({
      type: "text",
      x: 1.0,
      y: 5.55,
      w: 11.3,
      h: 0.9,
      align: "center",
      valign: "middle",
      runs: [
        { text: "「いろいろやっている」のではありません。", size: 17, bold: true, color: C.slate },
        { text: "ぜんぶ、つながっています。", size: 17, bold: true, color: C.green },
      ],
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 5. ひとつの糸でつながる（連鎖図） ---
  {
    const els = frame("5つは、ひとつの糸でつながる", "直す → 整える → 憩う → 健康に → 集う", 5);
    const chain = [
      { c: C.sekisui, step: "直す", who: "積水ハウス不動産", note: "空間を直す技術" },
      { c: C.laundry, step: "整える", who: "ランドリー／乾燥機", note: "日常と産業を支える" },
      { c: C.sauna, step: "憩う", who: "KÖWA SAUNA", note: "ととのう体験へ昇華" },
      { c: C.wellness, step: "健康に", who: "ウェルネス", note: "心と体の健康" },
      { c: C.food, step: "集う", who: "飲食カフェ", note: "人と地域がつながる" },
    ];
    const cw = 2.15;
    const gap = 0.27;
    let x = 0.72;
    chain.forEach((ch, i) => {
      els.push({
        type: "text",
        x,
        y: 2.5,
        w: cw,
        h: 1.9,
        fill: C.white,
        line: { color: ch.c, width: 2 },
        radius: 0.12,
        align: "center",
        valign: "middle",
        lineSpacingMultiple: 1.05,
        runs: [
          { text: ch.step, size: 22, bold: true, color: ch.c, break: true },
          { text: ch.who, size: 11.5, bold: true, color: C.slate, break: true },
          { text: ch.note, size: 9.5, color: C.gray },
        ],
      });
      if (i < chain.length - 1) {
        // 矢印（>）
        els.push({
          type: "text",
          x: x + cw - 0.02,
          y: 2.5,
          w: gap + 0.04,
          h: 1.9,
          align: "center",
          valign: "middle",
          runs: [{ text: "›", size: 26, bold: true, color: C.green }],
        });
      }
      x += cw + gap;
    });
    // 縦糸・横糸の説明
    els.push({
      type: "text",
      x: 1.0,
      y: 4.95,
      w: 5.6,
      h: 1.4,
      fill: C.green,
      radius: 0.1,
      align: "left",
      valign: "middle",
      lineSpacingMultiple: 1.05,
      runs: [
        { text: "縦糸 ＝ 技術", size: 16, bold: true, color: C.white, break: true },
        { text: "「直す力」を、整える・憩う・健康にする力へと育てていく。", size: 12.5, color: "E6F0E6" },
      ],
    });
    els.push({
      type: "text",
      x: 6.9,
      y: 4.95,
      w: 5.45,
      h: 1.4,
      fill: C.slate,
      radius: 0.1,
      align: "left",
      valign: "middle",
      lineSpacingMultiple: 1.05,
      runs: [
        { text: "横糸 ＝ 地域", size: 16, bold: true, color: C.white, break: true },
        { text: "大和町・宮城の暮らしを、住・健康・食・産業で多面的に支える。", size: 12.5, color: "EDEDEF" },
      ],
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 6. 世の中とどうつながるか ---
  {
    const els = frame("世の中と、どうつながるか", "私たちの仕事が、社会の課題とつながっていく。", 6);
    const items = [
      { c: C.wellness, t: "働く人の健康", b: "健康経営コンサル・BrainSleep の睡眠・保険相談で、企業と人の「元気」を支える。" },
      { c: C.laundry, t: "地域と産業", b: "コインランドリーは暮らしのインフラ。穀物乾燥機の組立（JA連携）で農業も支える。" },
      { c: C.food, t: "社会への還元", b: "アニマルフレンドリーカフェ。売上の一部を動物保護団体へ寄付し、地域の集いの場をつくる。" },
      { c: C.sauna, t: "誇りを、新しい価値に", b: "「リフォーム屋が本気で作る」サウナ。職人の誇りが、人を“ととのえる”体験になる。" },
    ];
    const cw = 5.6;
    const ch = 1.75;
    const positions = [
      [1.0, 2.1],
      [6.85, 2.1],
      [1.0, 4.05],
      [6.85, 4.05],
    ];
    items.forEach((it, i) => {
      const [x, y] = positions[i];
      els.push({ type: "rect", x, y, w: 0.12, h: ch, fill: it.c, radius: 0.03 });
      els.push({
        type: "text",
        x: x + 0.28,
        y: y - 0.02,
        w: cw - 0.4,
        h: 0.5,
        align: "left",
        valign: "middle",
        runs: [{ text: it.t, size: 16, bold: true, color: it.c }],
      });
      els.push({
        type: "text",
        x: x + 0.28,
        y: y + 0.5,
        w: cw - 0.4,
        h: 1.2,
        align: "left",
        valign: "top",
        lineSpacingMultiple: 1.1,
        runs: [{ text: it.b, size: 13, color: C.slate }],
      });
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 7. これからの拠点・店舗像 ---
  {
    const els = frame("これからの拠点・店舗", "地域に、“光和の顔”が増えていく。", 7);
    const places = [
      {
        c: C.sauna,
        t: "KÖWA SAUNA",
        tag: "完全貸切プライベートサウナ",
        b: "社長直轄。リフォームの技術で作り込んだ空間で、「ととのう」を独り占めできる場所に。",
      },
      {
        c: C.food,
        t: "杜の丘 カフェ",
        tag: "POPUP → クラファン → 2年後に店舗",
        b: "アニマルフレンドリーカフェ。まず試し、応援を集め、地域に根づく店へ育てていく。",
      },
      {
        c: C.wellness,
        t: "ウェルネス拠点",
        tag: "健康経営・保険・睡眠（8月〜）",
        b: "休憩室や寝具の福利厚生提案を入口に、サウナ・寝具の営業ともつながっていく。",
      },
    ];
    const cw = 3.75;
    let x = 1.0;
    places.forEach((p) => {
      els.push({
        type: "text",
        x,
        y: 2.15,
        w: cw,
        h: 0.95,
        fill: p.c,
        radius: 0.1,
        align: "center",
        valign: "middle",
        lineSpacingMultiple: 0.98,
        runs: [
          { text: p.t, size: 16, bold: true, color: C.white, break: true },
          { text: p.tag, size: 9, color: "F2F2F2" },
        ],
      });
      els.push({
        type: "text",
        x,
        y: 3.25,
        w: cw,
        h: 2.4,
        fill: C.white,
        line: { color: "E0E0DA", width: 1 },
        radius: 0.1,
        align: "left",
        valign: "top",
        lineSpacingMultiple: 1.12,
        runs: [{ text: p.b, size: 13.5, color: C.slate }],
      });
      x += cw + 0.33;
    });
    els.push({
      type: "text",
      x: 1.0,
      y: 6.05,
      w: 11.3,
      h: 0.6,
      align: "center",
      valign: "middle",
      runs: [{ text: "拠点が増えるほど、地域での出会いと仕事のきっかけが増えていく。", size: 14, italic: true, color: C.slate }],
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 8. 働き方が変わる ---
  {
    const els = frame("一人ひとりの、働き方", "ひとつの会社で、いくつもの経験と成長を。", 8);
    // 油谷モデル
    els.push({
      type: "text",
      x: 1.0,
      y: 2.15,
      w: 11.3,
      h: 0.95,
      fill: C.slate,
      radius: 0.1,
      align: "left",
      valign: "middle",
      lineSpacingMultiple: 1.0,
      runs: [
        { text: "例：油谷さんの働き方　", size: 16, bold: true, color: C.white },
        { text: "積水の定期巡回を軸に、サウナ・飲食・穀物乾燥機の組立まで横断サポート（JA新みやぎ18年・フォークリフト有）", size: 12, color: "EDEDEF" },
      ],
    });
    els.push(
      ...bullets(1.0, 3.45, 11.0, [
        { head: "マルチスキルへ。", sub: "一つの現場に縛られず、複数の事業で力を発揮できる。スキルの掛け算がその人の価値になる。" },
        { head: "兼務は、リスク分散でもある。", sub: "会社にとっては事業の柱が増えること。働く人にとっては、仕事が途切れにくくなること。" },
        { head: "成長の機会が、社内に広がる。", sub: "やってみたいことに手を挙げられる。新しい事業は、新しい役割とポジションを生む。" },
      ], { gap: 1.0, size: 16 })
    );
    slides.push({ bg: C.cream, els });
  }

  // --- 9. ビジョン（将来像） ---
  {
    const els = [];
    els.push({ type: "rect", x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, fill: C.green });
    els.push({ type: "rect", x: 0, y: 2.0, w: SLIDE_W, h: 0.1, fill: C.laundry });
    els.push({
      type: "text",
      x: 1.0,
      y: 0.85,
      w: 11.3,
      h: 0.5,
      align: "left",
      valign: "middle",
      runs: [{ text: "私たちのビジョン", size: 15, bold: true, color: "CFE3CF" }],
    });
    els.push({
      type: "text",
      x: 0.95,
      y: 2.5,
      w: 11.5,
      h: 2.0,
      align: "left",
      valign: "middle",
      lineSpacingMultiple: 1.12,
      runs: [
        { text: "「住まいの会社」から、", size: 30, bold: true, color: "CFE3CF", break: true },
        { text: "大和町発・“暮らしと健康”の", size: 40, bold: true, color: C.white, break: true },
        { text: "地域プラットフォームへ。", size: 40, bold: true, color: C.white },
      ],
    });
    els.push({
      type: "text",
      x: 1.0,
      y: 5.4,
      w: 11.3,
      h: 1.1,
      align: "left",
      valign: "middle",
      lineSpacingMultiple: 1.1,
      runs: [
        { text: "直す力で、人を、地域を、社会を、整えていく。", size: 20, bold: true, color: "F0F6F0", break: true },
        { text: "宮城の“ととのう暮らし”をつくる会社に。", size: 20, bold: true, color: "F0F6F0" },
      ],
    });
    slides.push({ bg: C.green, els });
  }

  // --- 10. みんなへ ---
  {
    const els = frame("みんなへ", "変わるのは「数」じゃない。社会との“つながり”が広がること。", 10);
    els.push(
      ...bullets(1.0, 2.25, 11.0, [
        { head: "土台は、これまでと同じ。", sub: "技術と、誠実さと、人。25年で積み上げたものは、これからも私たちの中心です。" },
        { head: "広がるのは、社会と関わる“面”。", sub: "住まいから、健康・食・地域・産業へ。私たちが役に立てる場所が増えていきます。" },
        { head: "新しい挑戦に、あなたの力を。", sub: "どの事業にも、一人ひとりの経験と工夫が必要です。やってみたいことは、ぜひ声に。" },
      ], { gap: 0.95, size: 16 })
    );
    els.push({
      type: "text",
      x: 1.0,
      y: 5.45,
      w: 11.3,
      h: 1.1,
      fill: C.green,
      radius: 0.12,
      align: "center",
      valign: "middle",
      runs: [{ text: "一緒に、つくっていきましょう。", size: 24, bold: true, color: C.white }],
    });
    slides.push({ bg: C.cream, els });
  }

  return slides;
}

module.exports = { SLIDE_W, SLIDE_H, buildSlides };
