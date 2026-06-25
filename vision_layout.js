// 社員向けビジョン資料「光和工業は、こう変わる。」レイアウト定義
// 全スライドをプリミティブ(rect/text/line)の配列として定義する。
// 配色は組織図(layout.js)と共通の Forest & Moss 系。
// 組織図スライドは layout.js の buildElements を再利用する。
const { C, buildElements: buildOrgElements } = require("./layout");

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// ===== 共通パーツ =====
// 各スライド共通の枠（左アクセントバー・キッカー・タイトル・下線）
// ページ番号は buildSlides 末尾でまとめて自動付与する。
function frame(kicker, title, opts) {
  if (typeof opts !== "object" || opts === null) opts = {};
  const els = [];
  els.push({ type: "rect", x: 0.55, y: 0.62, w: 0.14, h: 0.78, fill: C.green, radius: 0.04 });
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
  els.push({
    type: "text",
    x: 0.82,
    y: 0.92,
    w: 11.8,
    h: 0.7,
    align: "left",
    valign: "middle",
    runs: [{ text: title, size: 25, bold: true, color: opts.titleColor || C.green }],
  });
  els.push({ type: "line", x: 0.85, y: 1.72, w: 11.6, h: 0, color: "D8D8D2", width: 1.5 });
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

// 3カード横並び（タイトル帯＋本文）共通ヘルパ
function threeCards(els, y, cards, opts = {}) {
  const cw = opts.cw || 3.75;
  const gap = opts.gap || 0.33;
  const headH = opts.headH || 0.85;
  const bodyH = opts.bodyH || 2.6;
  const bodySize = opts.bodySize || 13.5;
  let x = opts.x0 || 1.0;
  cards.forEach((cd) => {
    els.push({
      type: "text",
      x,
      y,
      w: cw,
      h: headH,
      fill: cd.c,
      radius: 0.1,
      align: "center",
      valign: "middle",
      lineSpacingMultiple: 0.98,
      runs: cd.tag
        ? [
            { text: cd.t, size: 15, bold: true, color: C.white, break: true },
            { text: cd.tag, size: 9, color: "F2F2F2" },
          ]
        : [{ text: cd.t, size: 15, bold: true, color: C.white }],
    });
    els.push({
      type: "text",
      x,
      y: y + headH + 0.12,
      w: cw,
      h: bodyH,
      fill: C.white,
      line: { color: cd.border || "E0E0DA", width: 1 },
      radius: 0.1,
      align: "left",
      valign: "top",
      lineSpacingMultiple: 1.1,
      runs: [{ text: cd.b, size: bodySize, color: C.slate }],
    });
    x += cw + gap;
  });
}

// ===== スライド群 =====
function buildSlides() {
  const slides = [];

  // --- 1. 表紙 ---
  {
    const els = [];
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
      runs: [{ text: "有限会社 光和工業（宮城県黒川郡大和町・1997年創業）", size: 12, color: C.gray }],
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 2. これまでの私たち ---
  {
    const els = frame("これまでの私たち", "リフォーム屋として、約30年で積み上げてきたもの。");
    els.push(
      ...bullets(1.0, 2.15, 7.0, [
        { head: "1997年、大和町で創業。", sub: "積水ハウス不動産の原状回復・リノベを支えるリフォーム屋として。" },
        { head: "培ったのは「空間を直す技術」。", sub: "退去・原状回復・アフター・定期巡回 ― 現場の段取り力と確かな手仕事。" },
        { head: "そして何より、信頼。", sub: "任せてもらえる関係を、一件ずつ積み重ねてきた。" },
      ])
    );
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

  // --- 3. 会社の実績と体制 ---
  {
    const els = frame("会社の実績と体制", "取引先と、拠点と、現場の力。");
    threeCards(els, 2.15, [
      {
        c: C.sekisui,
        t: "主な取引先",
        b: "・積水ハウス不動産（PM）\n・株式会社 山一地所\n・サステム\n・LIXILトータルサービス\n・自社アパートの賃貸運営",
      },
      {
        c: C.laundry,
        t: "拠点（すべて自社所有）",
        b: "・本社：大和町 杜の丘1丁目\n・ランドリー：仙台市青葉区立町\n・アパート：仙台市青葉区立町\n\n地元・大和町に根を張りつつ、仙台にも拠点を持つ。",
      },
      {
        c: C.green,
        t: "現場の力（事業モデル）",
        b: "売上の約6割を協力業者と分担する「施工管理型」。自社で工程管理ができる段取り力と、急な原状回復にも応える対応力が強み。",
      },
    ]);
    els.push({
      type: "text",
      x: 1.0,
      y: 5.65,
      w: 11.3,
      h: 0.7,
      align: "center",
      valign: "middle",
      runs: [
        { text: "創業以来の取引先との信頼が、そのまま新しい事業の“入口”になる。", size: 14, italic: true, color: C.slate },
      ],
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 4. なぜ、いま変わるのか ---
  {
    const els = frame("なぜ、いま変わるのか", "世の中が変わっている。だから私たちも動く。");
    threeCards(els, 2.2, [
      {
        c: C.slate,
        t: "地方は、人口減と担い手不足",
        b: "単一の下請けだけでは、会社の未来が「一社の事情」に左右されてしまう。積水からの発注も近年は減少傾向。事業の柱を増やすことは、みんなの雇用を守ること。",
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
    ]);
    slides.push({ bg: C.cream, els });
  }

  // --- 5. 新しい私たちの姿（5事業） ---
  {
    const els = frame("新しい私たちの姿", "5つの事業で、暮らしを多面的に支える。");
    const biz = [
      { c: C.sekisui, t: "積水ハウス不動産", s: "退去・原状回復・リノベ", d: "本業。積水・山一・LIXILの工事を受託。すべての土台。" },
      { c: C.laundry, t: "ランドリー moco", s: "コインランドリー＋穀物乾燥機", d: "moco運営。AQUA/TOSEI代理店で機器販売も。" },
      { c: C.sauna, t: "KÖWA SAUNA", s: "完全貸切プライベートサウナ", d: "kokolo製。月額2万・週2回の貸切サブスク。" },
      { c: C.wellness, t: "ウェルネス", s: "健康経営／保険・睡眠", d: "BrainSleep代理店。健康経営支援から保険まで。" },
      { c: C.food, t: "飲食（カフェ）", s: "アニマルフレンドリーカフェ", d: "売上の一部を動物保護へ。杜の丘で出店予定。" },
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
        h: 1.7,
        fill: C.white,
        line: { color: b.c, width: 1 },
        radius: 0.1,
        align: "left",
        valign: "top",
        lineSpacingMultiple: 1.08,
        runs: [{ text: b.d, size: 11.5, color: C.slate }],
      });
      x += cw + 0.2;
    });
    els.push({
      type: "text",
      x: 1.0,
      y: 5.7,
      w: 11.3,
      h: 0.8,
      align: "center",
      valign: "middle",
      runs: [
        { text: "「いろいろやっている」のではありません。", size: 17, bold: true, color: C.slate },
        { text: "ぜんぶ、つながっています。", size: 17, bold: true, color: C.green },
      ],
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 6. 組織図（layout.js を再利用） ---
  {
    slides.push({ bg: C.cream, els: buildOrgElements(), noPage: true });
  }

  // --- 7. ひとつの糸でつながる（連鎖図） ---
  {
    const els = frame("5つは、ひとつの糸でつながる", "直す → 整える → 憩う → 健康に → 集う");
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

  // --- 8. 5事業はこう連携する（クロス連携の具体例） ---
  {
    const els = frame("5事業は、こう連携する", "事業どうしが、お客様と仕事を渡し合う。");
    const links = [
      { c: C.sekisui, pair: "積水 × サウナ", b: "賃貸オーナーに「サウナ付き物件」を提案。原状回復の延長で、付加価値リノベに。" },
      { c: C.laundry, pair: "リフォーム × ランドリー", b: "アパート・店舗にコインランドリーや業務用機器（AQUA/TOSEI）を設備提案。" },
      { c: C.sauna, pair: "サウナ × ウェルネス", b: "企業の福利厚生にサウナ利用。BrainSleepの睡眠×サウナで「ととのう＋眠る」。" },
      { c: C.wellness, pair: "ウェルネス × サウナ／ランドリー", b: "健康経営・福利厚生の提案を入口に、サウナ・寝具・ランドリーも一緒に営業。" },
      { c: C.food, pair: "サウナ × カフェ", b: "ととのった後の“サ飯”。杜の丘でサウナ＋カフェを一日の体験に。" },
      { c: C.green, pair: "ランドリー × 乾燥機 × 農業", b: "穀物乾燥機の組立から農業設備へ。JA新みやぎの人脈を活かす。" },
    ];
    const cw = 5.6;
    const gap = 0.18;
    const ch = 1.32;
    const vgap = 0.13;
    links.forEach((l, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 1.0 + col * (cw + gap);
      const y = 2.05 + row * (ch + vgap);
      els.push({ type: "rect", x, y, w: 0.12, h: ch, fill: l.c, radius: 0.03 });
      els.push({
        type: "text",
        x: x + 0.26,
        y: y + 0.04,
        w: cw - 0.4,
        h: 0.44,
        align: "left",
        valign: "middle",
        runs: [{ text: l.pair, size: 14, bold: true, color: l.c }],
      });
      els.push({
        type: "text",
        x: x + 0.26,
        y: y + 0.5,
        w: cw - 0.4,
        h: 0.78,
        align: "left",
        valign: "top",
        lineSpacingMultiple: 1.05,
        runs: [{ text: l.b, size: 12, color: C.slate }],
      });
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 9. 世の中とどうつながるか ---
  {
    const els = frame("世の中と、どうつながるか", "私たちの仕事が、社会の課題とつながっていく。");
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

  // --- 10. サウナ事業を深掘り ---
  {
    const els = frame("KÖWA SAUNA を深掘り", "リフォーム屋が本気で作る、完全貸切サウナ。", { titleColor: C.sauna });
    threeCards(
      els,
      2.1,
      [
        {
          c: C.sauna,
          t: "商品",
          b: "kokolo sauna 社製の PSE認証バレルサウナ＋水風呂＋冷却チラー。FSC認証の高品質な木材。住宅・敷地に合わせた柔軟設計。",
        },
        {
          c: C.sauna,
          t: "ビジネスのかたち",
          b: "①月額2万円・週2回の貸切サブスク体験\n②「入ってから買える」体験型ショールーム\n③設備の販売・設置＋リフォーム一式",
        },
        {
          c: C.sauna,
          t: "ねらう顧客",
          b: "自宅サウナを検討する30〜60代の健康志向・中高所得層。賃貸オーナー・工務店・設計事務所などBtoBも。",
        },
      ],
      { bodyH: 2.35, bodySize: 12.5 }
    );
    els.push({
      type: "text",
      x: 1.0,
      y: 4.95,
      w: 11.3,
      h: 0.85,
      fill: C.slate,
      radius: 0.1,
      align: "center",
      valign: "middle",
      lineSpacingMultiple: 1.05,
      runs: [
        { text: "競合との違い　", size: 14, bold: true, color: C.white },
        { text: "HARVIA・メトス・MySauna（98〜176万）に対し、唯一「体験してから買える屋外モデル展示」で勝負。", size: 12.5, color: "EDEDEF" },
      ],
    });
    els.push({
      type: "text",
      x: 1.0,
      y: 5.95,
      w: 11.3,
      h: 0.6,
      align: "center",
      valign: "middle",
      runs: [
        { text: "顧客の声：「自宅に整う空間が欲しい」「実物を見て買いたい」「別荘・宿泊にサウナを」「整体・エステに整い要素を」", size: 11.5, italic: true, color: C.sauna },
      ],
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 11. これから広がりそうな事業 ---
  {
    const els = frame("これから、広がりそうな事業", "5つの事業の“となり”には、次の種がある。");
    const cols = [
      {
        c: C.sekisui,
        t: "住まい・不動産の“となり”",
        items: ["サウナ付き賃貸／ウェルネス住宅（自社アパート活用）", "空き家活用・オーナー提案型リノベ"],
      },
      {
        c: C.wellness,
        t: "健康・くらしの“となり”",
        items: ["健康経営まるごとパッケージ（サウナ＋睡眠＋食）", "BrainSleep寝具・健康グッズの物販／法人提案"],
      },
      {
        c: C.laundry,
        t: "ものづくり・地域の“となり”",
        items: ["農業・産業設備の組立受託（穀物乾燥機の先へ）", "宿泊・グランピング・整体施設向けサウナ（BtoB）"],
      },
    ];
    const cw = 3.75;
    let x = 1.0;
    cols.forEach((col) => {
      els.push({
        type: "text",
        x,
        y: 2.15,
        w: cw,
        h: 0.7,
        fill: col.c,
        radius: 0.1,
        align: "center",
        valign: "middle",
        runs: [{ text: col.t, size: 13.5, bold: true, color: C.white }],
      });
      let iy = 3.0;
      col.items.forEach((it) => {
        els.push({
          type: "text",
          x,
          y: iy,
          w: cw,
          h: 1.25,
          fill: C.white,
          line: { color: col.c, width: 1 },
          radius: 0.1,
          align: "left",
          valign: "middle",
          lineSpacingMultiple: 1.08,
          runs: [
            { text: "● ", size: 11, bold: true, color: col.c },
            { text: it, size: 12.5, color: C.slate },
          ],
        });
        iy += 1.37;
      });
      x += cw + 0.33;
    });
    els.push({
      type: "text",
      x: 1.0,
      y: 6.15,
      w: 11.3,
      h: 0.6,
      align: "center",
      valign: "middle",
      runs: [
        { text: "どれも「いまの事業の延長線上」。無理な飛び地ではなく、地続きで広げていく。", size: 14, italic: true, color: C.slate },
      ],
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 12. これからの拠点・店舗像 ---
  {
    const els = frame("これからの拠点・店舗", "地域に、“光和の顔”が増えていく。");
    threeCards(
      els,
      2.15,
      [
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
      ],
      { bodyH: 2.4 }
    );
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

  // --- 13. 一人ひとりの働き方 ---
  {
    const els = frame("一人ひとりの、働き方", "ほとんどの人は、これまで通り。一部の人が、横断する。");
    // 前置きバナー
    els.push({
      type: "text",
      x: 1.0,
      y: 2.0,
      w: 11.3,
      h: 0.78,
      fill: C.green,
      radius: 0.1,
      align: "center",
      valign: "middle",
      lineSpacingMultiple: 1.0,
      runs: [
        { text: "働き方は、大きくは変わりません。", size: 14, bold: true, color: C.white },
        { text: "多くの人は本業のまま。そのうえで、一部の人が事業をまたいで活躍します。", size: 13, color: "E6F0E6" },
      ],
    });
    // 人物カード2枚
    const people = [
      {
        c: C.slate,
        name: "油谷さん",
        role: "積水・定期巡回の補佐 ＋ 雑務オールマイティ",
        b: "猪股さんの下で定期巡回を支えつつ、雑務もオールマイティに。さらにサウナ・飲食・穀物乾燥機の組立まで横断サポート。（JA新みやぎ18年・フォークリフト有）",
      },
      {
        c: C.wellness,
        name: "小林さん（ウェルネス）",
        role: "健康経営コンサル",
        b: "健康経営支援や福利厚生提案など、さまざまな提案をしながら、その流れでサウナ・ランドリーの営業も担う。コンサルが“入口”になる。",
      },
    ];
    let px = 1.0;
    people.forEach((p) => {
      els.push({ type: "rect", x: px, y: 3.05, w: 5.55, h: 1.95, fill: C.white, line: { color: p.c, width: 1.5 }, radius: 0.1 });
      els.push({
        type: "text",
        x: px + 0.22,
        y: 3.2,
        w: 5.1,
        h: 0.66,
        align: "left",
        valign: "middle",
        lineSpacingMultiple: 0.98,
        runs: [
          { text: p.name, size: 15, bold: true, color: p.c, break: true },
          { text: p.role, size: 10.5, bold: true, color: C.gray },
        ],
      });
      els.push({
        type: "text",
        x: px + 0.22,
        y: 3.92,
        w: 5.1,
        h: 0.98,
        align: "left",
        valign: "top",
        lineSpacingMultiple: 1.08,
        runs: [{ text: p.b, size: 12, color: C.slate }],
      });
      px += 5.55 + 0.2;
    });
    els.push(
      ...bullets(1.0, 5.25, 11.3, [
        { head: "マルチスキルは、価値の掛け算。", sub: "複数の事業で力を発揮できる人が、これからの光和を支える。" },
        { head: "兼務は、リスク分散でもある。", sub: "仕事が途切れにくく、挑戦と成長の機会も広がる。やってみたいことは、ぜひ声に。" },
      ], { gap: 0.78, size: 15 })
    );
    slides.push({ bg: C.cream, els });
  }

  // --- 14. ロードマップ ---
  {
    const els = frame("ロードマップ", "5つの事業がそろうまで、そして、その先へ。");
    els.push({ type: "line", x: 1.0, y: 2.22, w: 11.3, h: 0, color: C.green, width: 2.5, endArrow: true });
    const phases = [
      {
        c: C.slate,
        title: "これまで（〜2024）",
        items: [
          { y: "1997", t: "創業。積水ハウス不動産の原状回復・リノベを本業に" },
          { y: "2023", t: "ランドリー事業 開始（コインランドリー moco）" },
          { y: "2024", t: "サウナ事業に着手（KÖWA SAUNA 開発）" },
        ],
      },
      {
        c: C.green,
        title: "いま（2025〜2026）",
        items: [
          { y: "2025.7", t: "穀物乾燥機の組立を請負（朝日製作所）" },
          { y: "2026.7", t: "ランドリー周辺の新規業務が本格化" },
          { y: "2026.8", t: "新体制スタート・ウェルネス事業 開始" },
        ],
      },
      {
        c: C.laundry,
        title: "これから（2027〜）",
        items: [
          { y: "2027〜", t: "サウナ体験型ショールームを展開" },
          { y: "約2年後", t: "カフェ：POPUP → クラファン → 店舗出店" },
          { y: "目標", t: "5事業で年商7億円へ" },
        ],
      },
    ];
    const cw = 3.6;
    const gap = 0.28;
    let x = 1.0;
    phases.forEach((ph) => {
      els.push({ type: "rect", x: x + cw / 2 - 0.09, y: 2.13, w: 0.18, h: 0.18, fill: ph.c, radius: 0.09 });
      els.push({
        type: "text",
        x,
        y: 2.55,
        w: cw,
        h: 0.6,
        fill: ph.c,
        radius: 0.1,
        align: "center",
        valign: "middle",
        runs: [{ text: ph.title, size: 14, bold: true, color: C.white }],
      });
      let iy = 3.35;
      ph.items.forEach((it) => {
        els.push({
          type: "text",
          x,
          y: iy,
          w: cw,
          h: 0.95,
          fill: C.white,
          line: { color: "E0E0DA", width: 1 },
          radius: 0.08,
          align: "left",
          valign: "middle",
          lineSpacingMultiple: 1.0,
          runs: [
            { text: it.y + "　", size: 12.5, bold: true, color: ph.c },
            { text: it.t, size: 11.5, color: C.slate },
          ],
        });
        iy += 1.05;
      });
      x += cw + gap;
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 15. 数字で見る目標 ---
  {
    const els = frame("数字で見る目標", "現在地は約4.65億円。目指すは、年商7億円。");
    els.push({
      type: "text",
      x: 1.0,
      y: 1.95,
      w: 4.55,
      h: 1.05,
      fill: C.slate,
      radius: 0.1,
      align: "center",
      valign: "middle",
      lineSpacingMultiple: 1.0,
      runs: [
        { text: "現在地　", size: 13, bold: true, color: "D8DDE0" },
        { text: "約4.65億円", size: 24, bold: true, color: C.white, break: true },
        { text: "第26期（R6.7〜R7.6）売上高", size: 9.5, color: "D8DDE0" },
      ],
    });
    els.push({
      type: "text",
      x: 5.65,
      y: 1.95,
      w: 2.0,
      h: 1.05,
      align: "center",
      valign: "middle",
      lineSpacingMultiple: 1.0,
      runs: [
        { text: "＋2.35億", size: 14, bold: true, color: C.laundry, break: true },
        { text: "›", size: 30, bold: true, color: C.green },
      ],
    });
    els.push({
      type: "text",
      x: 7.75,
      y: 1.95,
      w: 4.55,
      h: 1.05,
      fill: C.green,
      radius: 0.1,
      align: "center",
      valign: "middle",
      lineSpacingMultiple: 1.0,
      runs: [
        { text: "目標　", size: 13, bold: true, color: "CFE3CF" },
        { text: "7億円", size: 26, bold: true, color: C.white, break: true },
        { text: "5事業の合計で", size: 9.5, color: "CFE3CF" },
      ],
    });
    els.push({
      type: "text",
      x: 1.0,
      y: 3.25,
      w: 11.3,
      h: 0.32,
      align: "left",
      valign: "middle",
      runs: [{ text: "目標 7億円の内訳", size: 12, bold: true, color: C.slate }],
    });
    const segs = [
      { c: C.sekisui, amt: 3, label: "3億" },
      { c: C.laundry, amt: 2, label: "2億" },
      { c: C.green, amt: 1, label: "1億" },
      { c: C.sauna, amt: 1, label: "1億" },
    ];
    const barX = 1.0;
    const barY = 3.62;
    const barW = 11.3;
    const barH = 0.82;
    const total = 7;
    let sx = barX;
    segs.forEach((s) => {
      const w = barW * (s.amt / total);
      els.push({
        type: "text",
        x: sx,
        y: barY,
        w,
        h: barH,
        fill: s.c,
        radius: 0.04,
        align: "center",
        valign: "middle",
        runs: [{ text: s.label, size: 16, bold: true, color: C.white }],
      });
      sx += w;
    });
    const legend = [
      { c: C.sekisui, name: "リフォーム本業", sub: "積水ハウス不動産 等", amt: "3億円", note: "会社の土台（実績あり）" },
      { c: C.laundry, name: "ランドリー事業", sub: "moco・穀物乾燥機", amt: "2億円", note: "現状 約1億 → 倍増へ" },
      { c: C.green, name: "代表直轄リフォーム", sub: "LIXIL等・広顕の現場", amt: "1億円", note: "社長の現場力" },
      { c: C.sauna, name: "新規3事業", sub: "サウナ・ウェルネス・カフェ", amt: "1億円", note: "現状ほぼ0 → 育てる" },
    ];
    const lcw = 2.7;
    const lgap = 0.17;
    let lx = 1.0;
    legend.forEach((l) => {
      els.push({ type: "rect", x: lx, y: 4.72, w: lcw, h: 1.62, fill: C.white, line: { color: l.c, width: 1.5 }, radius: 0.1 });
      els.push({
        type: "text",
        x: lx + 0.18,
        y: 4.82,
        w: lcw - 0.36,
        h: 0.62,
        align: "left",
        valign: "middle",
        lineSpacingMultiple: 0.98,
        runs: [
          { text: l.name, size: 12.5, bold: true, color: l.c, break: true },
          { text: l.sub, size: 8.5, color: C.gray },
        ],
      });
      els.push({
        type: "text",
        x: lx + 0.18,
        y: 5.46,
        w: lcw - 0.36,
        h: 0.5,
        align: "left",
        valign: "middle",
        runs: [{ text: l.amt, size: 20, bold: true, color: l.c }],
      });
      els.push({
        type: "text",
        x: lx + 0.18,
        y: 5.96,
        w: lcw - 0.36,
        h: 0.32,
        align: "left",
        valign: "middle",
        runs: [{ text: l.note, size: 9.5, color: C.slate }],
      });
      lx += lcw + lgap;
    });
    els.push({
      type: "text",
      x: 1.0,
      y: 6.52,
      w: 11.3,
      h: 0.42,
      align: "center",
      valign: "middle",
      runs: [
        { text: "本業（約4.3億の工事実績）を土台に、ランドリー（現状約1億）を倍増、新規事業1億を加えて7億へ。", size: 12, italic: true, color: C.slate },
      ],
    });
    slides.push({ bg: C.cream, els });
  }

  // --- 16. ビジョン（将来像） ---
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
    slides.push({ bg: C.green, els, noPage: true });
  }

  // --- 17. みんなへ ---
  {
    const els = frame("みんなへ", "変わるのは「数」じゃない。社会との“つながり”が広がること。");
    els.push(
      ...bullets(1.0, 2.25, 11.0, [
        { head: "土台は、これまでと同じ。", sub: "技術と、誠実さと、人。約30年で積み上げたものは、これからも私たちの中心です。" },
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

  // ===== ページ番号を自動付与（表紙・組織図・ビジョンは除く） =====
  slides.forEach((s, i) => {
    if (i === 0 || s.noPage) return;
    const dark = s.bg === C.green;
    s.els.push({
      type: "text",
      x: 12.2,
      y: 6.98,
      w: 0.9,
      h: 0.34,
      align: "right",
      valign: "middle",
      runs: [{ text: String(i + 1), size: 11, color: dark ? "CFE3CF" : C.gray }],
    });
  });

  return slides;
}

module.exports = { SLIDE_W, SLIDE_H, buildSlides };
