/**
 * 現場支配シートZ ── 仮工程 受け口（独立プロジェクト版 / doPost）
 * ------------------------------------------------------------------
 * 本番シートZのGASプロジェクト(スマホサイト稼働中)とは分離した
 * 独立プロジェクトとして動く受け口。openByIdで本番シートに書く。
 * ※本番プロジェクトに doGet/doPost を追加するとスマホサイトと衝突するため独立させた。
 *
 * 役割：kowa-koutei が起こした「仮工程」JSONを受け取り、
 *       専用タブ「仮工程_受信」に1行ずつ追記する。
 *
 * ★安全設計（光和グループ絶対ルール）：
 *   - 人間が手書きしたメイン台帳には絶対に書き込まない。
 *   - 着地先は専用タブ「仮工程_受信」だけ。社長が確認→手でメイン板へ昇格。
 *   - 共有シークレット(SECRET)が一致しないPOSTは拒否（無断書き込み防止）。
 */

var SHEET_Z_ID = '1KuSbvjVNJWtEJtiVvfh-S1i4rREvdMGWkLQ7GM-ka5k'; // 本番=テンプレート_再発行版
var RECV_SHEET_NAME = '仮工程_受信';
var HEADERS = [
  '受信日時', '物件名', '住所', '備考',
  '工種', '作業', '業者', '開始(仮)', '終了(仮)',
  '出典', '状態'
];

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // --- 認証（共有シークレット）---
    var secret = PropertiesService.getScriptProperties().getProperty('KARI_KOUTEI_SECRET');
    if (!secret || body.secret !== secret) {
      return _json({ ok: false, error: 'unauthorized' });
    }

    var bukken = body.bukken || {};
    var koutei = body.koutei || [];
    if (!bukken.name || koutei.length === 0) {
      return _json({ ok: false, error: 'bukken.name と koutei[] は必須です' });
    }

    var sheet = _getRecvSheet();
    var now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
    var rows = koutei.map(function (k) {
      return [
        now,
        bukken.name,
        bukken.address || '確認中',
        bukken.note || '',
        k.kubun || '',           // 工種（内装工事 等）
        k.sagyou || '',          // 作業（クロス張替 等）
        k.gyousha || '',         // 担当業者
        k.start || '',           // 開始(仮)
        k.end || '',             // 終了(仮)
        body.source || '',       // 出典（メール件名/送信者 等）
        '仮（未反映）'
      ];
    });

    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    // 体裁ルール（社長指定）: 太字なし・全列左揃え
    sheet.getRange(sheet.getLastRow() - rows.length + 1, 1, rows.length, HEADERS.length)
         .setFontWeight('normal').setHorizontalAlignment('left');

    return _json({ ok: true, appended: rows.length, sheet: RECV_SHEET_NAME, bukken: bukken.name });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

/** 動作確認用（ブラウザでデプロイURLを開くと表示される） */
function doGet() {
  return _json({ ok: true, service: '現場支配シートZ 仮工程 受け口(独立版)', recvSheet: RECV_SHEET_NAME });
}

/** 受信タブを取得（無ければヘッダ付きで作成） */
function _getRecvSheet() {
  var ss = SpreadsheetApp.openById(SHEET_Z_ID);
  var sheet = ss.getSheetByName(RECV_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(RECV_SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
