// 有限会社 光和工業 組織図 — 共有レイアウトモデル
// 全要素を「プリミティブ」(rect / text / line) として inch 単位で定義する。
// pptx 生成 (generate_org_chart.js) と 検証用 HTML プレビュー (preview.js) が
// 同一データを参照することで、検証結果が実際の成果物と一致することを保証する。

// ===== 配色 (Forest & Moss 系) =====
const C = {
  green: "2C5F2D",
  slate: "36454F",
  cream: "F5F5F2",
  white: "FFFFFF",
  sekisui: "1C7293",
  laundry: "C9742E",
  sauna: "8C3B4A",
  wellness: "5B8C5A",
  food: "B07A3E",
  gray: "8A8A8A",
};

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// ===== 事業部門データ =====
const depts = [
  {
    color: C.sekisui,
    title: "積水ハウス不動産部門",
    sub: "退去・原状回復・リノベ／本業",
    members: [
      "高山（退去担当）",
      "泰弘（アフター・リノベ）",
      "猪股（定巡担当）",
      "渡邊（退去担当・内務）",
      "吉田（定巡担当・内務）",
      "油谷（定巡補佐・雑務）",
    ],
    note: null,
  },
  {
    color: C.laundry,
    title: "ランドリー事業部",
    sub: "コインランドリー moco",
    members: ["佐々 寛樹（事業部長）", "赤間", "猪股（補佐・兼務）"],
    note: "新規（7月〜）：朝日製作所より農業用穀物乾燥機の組立を請負",
  },
  {
    color: C.sauna,
    title: "サウナ事業",
    sub: "KÖWA SAUNA／社長直轄",
    members: ["佐藤 広顕（統括）"],
    note: "リフォーム屋が本気で作る完全貸切プライベートサウナ",
  },
  {
    color: C.wellness,
    title: "ウェルネス事業",
    sub: "健康経営コンサル／保険相談・8月〜",
    members: ["小林"],
    note: "BrainSleep代理店。健康経営支援を軸に保険相談まで。福利厚生提案（休憩室・寝具）でサウナ・寝具の営業も兼ねる",
  },
  {
    color: C.food,
    title: "飲食事業",
    sub: "パニーニ／杜の丘・2年後本格稼働",
    members: ["細谷（中心）", "佐藤 美慧（サポート）", "油谷（サポート）"],
    note: "アニマルフレンドリーカフェ。売上の一部を動物保護団体へ寄付。POPUP→クラファン→2年後に店舗出店",
  },
];

// ===== レイアウト座標 =====
const centers = [1.35, 3.85, 6.35, 8.85, 11.35];
const cardW = 2.3;
const headerY = 3.0;
const headerH = 0.72;
const rowH = 0.34;
const rowGap = 0.08;
const rowsTop = headerY + headerH + 0.12;
const noteH = 0.95;

// 経営層
const repX = 4.4;
const repY = 1.05;
const repW = 4.5;
const repH = 0.85;
const senmuX = 9.35;
const senmuY = 1.05;
const senmuW = 3.55;
const senmuH = 0.85;
const repCenterX = repX + repW / 2;

const busBarY = 2.62;

// ===== プリミティブ生成 =====
function buildElements() {
  const els = [];

  // タイトル
  els.push({
    type: "text",
    x: 0.45,
    y: 0.22,
    w: 9.5,
    h: 0.6,
    align: "left",
    valign: "middle",
    runs: [{ text: "有限会社 光和工業　組織図", size: 28, bold: true, color: C.green, face: "Cambria" }],
  });

  // 右上バッジ
  els.push({
    type: "text",
    x: 10.55,
    y: 0.28,
    w: 2.35,
    h: 0.5,
    fill: C.slate,
    radius: 0.1,
    align: "center",
    valign: "middle",
    runs: [{ text: "2026年8月 新体制", size: 13, bold: true, color: C.white }],
  });

  // 代表取締役
  els.push({
    type: "text",
    x: repX,
    y: repY,
    w: repW,
    h: repH,
    fill: C.green,
    radius: 0.08,
    align: "center",
    valign: "middle",
    runs: [
      { text: "代表取締役　佐藤 広顕", size: 15, bold: true, color: C.white, break: true },
      { text: "総括・一般／LIXILリフォーム／サウナ事業", size: 10.5, color: "DDE6DD" },
    ],
  });

  // 専務
  els.push({
    type: "text",
    x: senmuX,
    y: senmuY,
    w: senmuW,
    h: senmuH,
    fill: C.slate,
    radius: 0.08,
    align: "center",
    valign: "middle",
    runs: [
      { text: "専務　佐藤 美慧（みえ）", size: 13.5, bold: true, color: C.white, break: true },
      { text: "内務総括／支払管理", size: 10.5, color: "E6E0E2" },
    ],
  });

  // 代表—専務 点線
  els.push({
    type: "line",
    x: repX + repW,
    y: repY + repH / 2,
    w: senmuX - (repX + repW),
    h: 0,
    color: C.slate,
    width: 1.5,
    dash: true,
  });

  // 幹線 (縦)
  els.push({
    type: "line",
    x: repCenterX,
    y: repY + repH,
    w: 0,
    h: busBarY - (repY + repH),
    color: C.green,
    width: 2.5,
  });
  // 横バー
  els.push({
    type: "line",
    x: centers[0],
    y: busBarY,
    w: centers[centers.length - 1] - centers[0],
    h: 0,
    color: C.green,
    width: 2.5,
  });
  // 各カードへの枝
  centers.forEach((cx) => {
    els.push({
      type: "line",
      x: cx,
      y: busBarY,
      w: 0,
      h: headerY - busBarY,
      color: C.green,
      width: 2,
    });
  });

  // 事業部門カード
  depts.forEach((d, i) => {
    const cx = centers[i];
    const x = cx - cardW / 2;

    // ヘッダー
    els.push({
      type: "text",
      x,
      y: headerY,
      w: cardW,
      h: headerH,
      fill: d.color,
      radius: 0.06,
      align: "center",
      valign: "middle",
      runs: [
        { text: d.title, size: 12, bold: true, color: C.white, break: true },
        { text: d.sub, size: 8.5, color: "F2F2F2" },
      ],
    });

    // 社員行
    let ry = rowsTop;
    d.members.forEach((m) => {
      els.push({
        type: "text",
        x,
        y: ry,
        w: cardW,
        h: rowH,
        fill: C.white,
        line: { color: d.color, width: 1 },
        radius: 0.04,
        align: "center",
        valign: "middle",
        runs: [{ text: m, size: 10, color: C.slate }],
      });
      ry += rowH + rowGap;
    });

    // 脚注
    if (d.note) {
      els.push({
        type: "text",
        x,
        y: ry + 0.02,
        w: cardW,
        h: noteH,
        align: "left",
        valign: "top",
        runs: [{ text: d.note, size: 7.5, italic: true, color: d.color }],
      });
    }
  });

  // サウナ ↔ ウェルネス 双方向点線矢印
  const saunaRight = centers[2] + cardW / 2;
  const wellnessLeft = centers[3] - cardW / 2;
  els.push({
    type: "line",
    x: saunaRight,
    y: headerY + headerH / 2,
    w: wellnessLeft - saunaRight,
    h: 0,
    color: C.slate,
    width: 1.25,
    dash: true,
    beginArrow: true,
    endArrow: true,
  });

  // フッター
  els.push({
    type: "text",
    x: 0.4,
    y: 7.02,
    w: 12.53,
    h: 0.4,
    align: "center",
    valign: "middle",
    runs: [
      {
        text:
          "有限会社 光和工業（宮城県黒川郡大和町・1997年創業）　油谷：積水定巡を軸にサウナ・飲食・穀物乾燥機組立を横断サポート（JA新みやぎ18年・フォークリフト有）",
        size: 8.5,
        color: C.gray,
      },
    ],
  });

  return els;
}

module.exports = { C, SLIDE_W, SLIDE_H, buildElements };
