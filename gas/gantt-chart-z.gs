/**
 * 光和工業 現場工程表「ガントチャートZ」 自動整形スクリプト（整理・修正版）
 *
 * 主な役割:
 *  - 工程の緑バー以外の背景リセット
 *  - 日曜・祝日・土曜の色分け、今日の位置に赤い縦線
 *  - 🏠見出し行（お客様邸）から3行を黄色に
 *  - 住所をGoogleマップのリンクに変換
 *  - 関連各社様用シートへ同期
 *  - ★カレンダー送り（F4を動かすだけで日付＋工程バーが一緒に動く）
 *
 * 設計メモ:
 *  ヘッダー（年=2行 / 月=3行 / 日付=4行 / 曜日=5行）は F4 を起点とした数式で自動計算される。
 *  → カレンダーを動かすときは F4 を変更するだけ。ヘッダーを値で上書きしないこと（数式が壊れる）。
 */

/*** ===== 設定（調整はここだけ） ===== ***/
const CFG = {
  sheetName: 'ガントチャートZ',
  holidaySheetName: '祝日',

  dateRow: 4,        // 日付行（F4が起点の本物の日付。G4以降は =F4+1 …）
  weekdayRow: 5,     // 曜日行（数式）
  dataStartRow: 6,   // 工程データ開始行
  startCol: 6,       // F列
  endCol: 96,        // CQ列

  greenColor:    '#c6efce', // 工程の緑
  yellowColor:   '#fff6d6', // 🏠見出し行の黄色
  holidayColor:  '#fce4d6', // 日曜・祝日
  saturdayColor: '#cce5ff', // 土曜
  redLine:       '#ff0000', // 今日の線

  shiftDays: 7,      // カレンダー送りの日数（7=1週間）

  // 関連各社様用シートへの同期先
  targetSsId: '1lRO9b2pIXuSlvvEv65gAhDpPxz1gkhsbU0f0peSgfGA',
  targetSheetName: '関連各社様閲覧用',
};

/*** ===== 共通ヘルパー ===== ***/
function getMainSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.sheetName);
}

// データ最終行（値のある最終行。書式だけの空行は無視される）
function getLastDataRow_(sheet) {
  return Math.max(sheet.getLastRow(), CFG.dataStartRow);
}

// 祝日を "yyyy/MM/dd" の Set で取得（Asia/Tokyo 基準）
function getHolidaySet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.holidaySheetName);
  if (!sh || sh.getLastRow() < 1) return new Set();
  const vals = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().flat();
  const set = new Set();
  vals.forEach(h => {
    if (!h) return;
    const d = new Date(h);
    if (!isNaN(d)) set.add(Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy/MM/dd'));
  });
  return set;
}

/*** ===== 司令塔：全フォーマットを一括更新 ===== ***/
function refreshAllCustomFormats() {
  clearBackgroundsKeepGreenYellow_();
  colorHouseRows_();
  linkAddressesToGoogleMaps_();
  colorHolidaysAndWeekends_();
  drawTodayRedLine_();
}

/*** ===== ① 背景リセット（緑・黄色は残す） ===== ***/
function clearBackgroundsKeepGreenYellow_() {
  const sheet = getMainSheet_();
  const lastRow = getLastDataRow_(sheet);
  const keep = [CFG.greenColor, CFG.yellowColor];

  const range = sheet.getRange(CFG.dateRow, 1, lastRow - CFG.dateRow + 1, CFG.endCol);
  const bg = range.getBackgrounds();
  for (let r = 0; r < bg.length; r++) {
    for (let c = 0; c < bg[r].length; c++) {
      if (!keep.includes(bg[r][c].toLowerCase())) bg[r][c] = null;
    }
  }
  range.setBackgrounds(bg);
}

/*** ===== ② 🏠見出し行から3行を黄色（はみ出しガード付き） ===== ***/
function colorHouseRows_() {
  const sheet = getMainSheet_();
  const lastRow = sheet.getLastRow();
  const colA = sheet.getRange(1, 1, lastRow, 1).getValues();

  for (let r = 0; r < colA.length; r++) {
    const v = colA[r][0];
    if (v && v.toString().includes('🏠')) {
      const rows = Math.min(3, lastRow - r); // 最終行付近でも安全
      sheet.getRange(r + 1, 1, rows, CFG.endCol).setBackground(CFG.yellowColor);
    }
  }
}

/*** ===== ③ 住所をGoogleマップのリンクに（既にリンク済みは飛ばす） ===== ***/
function linkAddressesToGoogleMaps_() {
  const sheet = getMainSheet_();
  const lastRow = sheet.getLastRow();
  const col = 2; // B列

  const values = sheet.getRange(1, col, lastRow, 1).getValues();
  const formulas = sheet.getRange(1, col, lastRow, 1).getFormulas();

  for (let r = 0; r < values.length; r++) {
    const address = values[r][0];
    const formula = formulas[r][0];
    if (address && /(県|市|町|郡)/.test(address)) {
      if (formula && formula.indexOf('HYPERLINK') !== -1) continue; // 二重処理を回避
      sheet.getRange(r + 1, col).setFormula(
        `=HYPERLINK("https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}", "${address}")`
      );
    }
  }
}

/*** ===== ④ 日曜・祝日・土曜の色分け（一括・高速） ===== ***/
function colorHolidaysAndWeekends_() {
  const sheet = getMainSheet_();
  const holidays = getHolidaySet_();
  const nCols = CFG.endCol - CFG.startCol + 1;
  const lastRow = getLastDataRow_(sheet);

  const dateRow = sheet.getRange(CFG.dateRow, CFG.startCol, 1, nCols).getValues()[0];
  const weekdayColors = [];

  const bodyRange = sheet.getRange(CFG.dataStartRow, CFG.startCol, lastRow - CFG.dataStartRow + 1, nCols);
  const bodyBg = bodyRange.getBackgrounds();

  for (let c = 0; c < dateRow.length; c++) {
    const cell = dateRow[c];
    if (!(cell instanceof Date)) { weekdayColors.push(null); continue; }
    const d = new Date(cell);
    const key = Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy/MM/dd');
    const isSunHol = holidays.has(key) || d.getDay() === 0;

    if (isSunHol) {
      weekdayColors.push(CFG.holidayColor);
      for (let r = 0; r < bodyBg.length; r++) {
        if (bodyBg[r][c].toLowerCase() !== CFG.greenColor) bodyBg[r][c] = CFG.holidayColor; // 緑工程は残す
      }
    } else if (d.getDay() === 6) {
      weekdayColors.push(CFG.saturdayColor);
    } else {
      weekdayColors.push(null);
    }
  }

  sheet.getRange(CFG.weekdayRow, CFG.startCol, 1, weekdayColors.length).setBackgrounds([weekdayColors]);
  bodyRange.setBackgrounds(bodyBg);
}

/*** ===== ⑤ 今日の赤い縦線（前回分だけ消して引き直す） ===== ***/
function drawTodayRedLine_() {
  const sheet = getMainSheet_();
  const nCols = CFG.endCol - CFG.startCol + 1;
  const topRow = 1;
  const lastRow = sheet.getLastRow();
  const props = PropertiesService.getDocumentProperties();

  // 前回引いた列の赤線だけ消す
  const prev = parseInt(props.getProperty('todayRedLineCol'), 10);
  if (prev >= CFG.startCol && prev <= CFG.endCol) {
    sheet.getRange(topRow, prev, lastRow - topRow + 1, 1)
      .setBorder(null, null, null, false, null, null);
  }

  // 今日の列を探して引く
  const dateRow = sheet.getRange(CFG.dateRow, CFG.startCol, 1, nCols).getValues()[0];
  const todayKey = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');

  let drawnCol = '';
  for (let c = 0; c < dateRow.length; c++) {
    const cell = dateRow[c];
    if (cell instanceof Date &&
        Utilities.formatDate(cell, 'Asia/Tokyo', 'yyyy/MM/dd') === todayKey) {
      const col = CFG.startCol + c;
      sheet.getRange(topRow, col, lastRow - topRow + 1, 1)
        .setBorder(null, null, null, true, null, null, CFG.redLine, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      drawnCol = col;
      break;
    }
  }
  props.setProperty('todayRedLineCol', String(drawnCol));
}

/*** ===== ⑥ カレンダー送り（F4を動かすだけ。数式が自動でヘッダー更新） ===== ***/
function advanceCalendar() { shiftCalendar_(CFG.shiftDays); }   // ⏩進める
function rewindCalendar()  { shiftCalendar_(-CFG.shiftDays); }  // ⏪戻す

function shiftCalendar_(days) {
  const sheet = getMainSheet_();
  const k = Math.abs(days);
  const nCols = CFG.endCol - CFG.startCol + 1;
  const lastRow = getLastDataRow_(sheet);

  // 1) 緑バー（背景）だけを左右にスライド
  const body = sheet.getRange(CFG.dataStartRow, CFG.startCol, lastRow - CFG.dataStartRow + 1, nCols);
  const bg = body.getBackgrounds();
  const blank = Array(k).fill(null);
  for (let r = 0; r < bg.length; r++) {
    bg[r] = days > 0
      ? bg[r].slice(k).concat(blank)               // 進める＝左へ
      : blank.concat(bg[r].slice(0, nCols - k));   // 戻す＝右へ
  }
  body.setBackgrounds(bg);

  // 2) F4 をずらすだけ → 日付・曜日・月・年は数式が自動更新
  const f4cell = sheet.getRange(CFG.dateRow, CFG.startCol);
  const f4 = f4cell.getValue();
  if (!(f4 instanceof Date)) { SpreadsheetApp.getUi().alert('先頭の日付セル（F4）に日付がありません。'); return; }
  const nd = new Date(f4);
  nd.setDate(nd.getDate() + days);
  f4cell.setValue(nd);

  // 3) 週末・祝日・今日の線を塗り直し
  clearBackgroundsKeepGreenYellow_();
  colorHouseRows_();
  colorHolidaysAndWeekends_();
  drawTodayRedLine_();
}

/*** ===== ⑦ 関連各社様用シートへ同期 ===== ***/
function syncGanttChartWithCopyTo() {
  const sourceSheet = getMainSheet_();
  const targetSs = SpreadsheetApp.openById(CFG.targetSsId);

  // 最後の1枚を消せないので一時シートで保護
  const temp = targetSs.insertSheet('TEMP_' + Date.now());
  const old = targetSs.getSheetByName(CFG.targetSheetName);
  if (old) targetSs.deleteSheet(old);

  sourceSheet.copyTo(targetSs).setName(CFG.targetSheetName);
  targetSs.deleteSheet(temp);
}

/*** ===== スマホ用：先頭列＆日付を固定表示（最初に1回実行） ===== ***/
function setupMobileView() {
  const sheet = getMainSheet_();
  sheet.setFrozenRows(CFG.weekdayRow); // 1〜5行目（タイトル・月・日付・曜日）を固定
  sheet.setFrozenColumns(3);           // A〜C列（工種・業者）を固定 ※1〜5に変更可
}

/*** ===== トリガー ===== ***/
// 日付（4行目=F4等）を編集したら色を更新（簡易トリガー）
function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== CFG.sheetName) return;
  if (e.range.getRow() === CFG.dateRow) {
    colorHolidaysAndWeekends_();
    drawTodayRedLine_();
  }
}

// 行を追加したら見出し色＆リンクを更新（※インストール型トリガー登録が必要）
function onChange(e) {
  const sheet = e.source.getActiveSheet();
  if (sheet.getName() !== CFG.sheetName) return;
  if (e.changeType === 'INSERT_ROW') {
    colorHouseRows_();
    linkAddressesToGoogleMaps_();
  }
}

// シートを開いたときにメニューを追加
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('工程表ツール')
    .addItem('⏩ カレンダーを1週間進める', 'advanceCalendar')
    .addItem('⏪ カレンダーを1週間戻す', 'rewindCalendar')
    .addSeparator()
    .addItem('全体を整える（色・リンク・赤線）', 'refreshAllCustomFormats')
    .addItem('今日の赤線だけ更新', 'drawTodayRedLine_')
    .addSeparator()
    .addItem('📱 スマホ用の固定表示を設定', 'setupMobileView')
    .addItem('関連各社様用シートへ同期', 'syncGanttChartWithCopyTo')
    .addToUi();
}
