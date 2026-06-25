# 有限会社 光和工業 組織図ジェネレーター

`pptxgenjs` を使って、有限会社 光和工業の組織図（16:9 ワイド・1枚スライド）の
PowerPoint を生成する Node.js スクリプトです。

## 構成

| ファイル | 役割 |
| --- | --- |
### 組織図

| ファイル | 役割 |
| --- | --- |
| `layout.js` | 組織図の配色・座標・所属を **プリミティブ**(rect/text/line) として定義した共有モデル |
| `generate_org_chart.js` | `layout.js` から `光和工業_組織図.pptx` を生成 |
| `preview.js` | `layout.js` を 96dpi の HTML として Chromium で描画し、`preview.png` を出力＋はみ出し自動検査 |

### ビジョン資料（社員向け「うちはこう変わる」）

| ファイル | 役割 |
| --- | --- |
| `vision_layout.js` | ビジョン資料（全10枚）のスライド定義。配色は組織図と共通 |
| `generate_vision_deck.js` | `光和工業_ビジョン資料.pptx`（10枚）を生成 |
| `preview_vision.js` | 各スライドを Chromium で描画し `vision_slideNN.png` を出力＋はみ出し自動検査 |
| `render.js` | 上記2系統が共有する描画基盤（pptx 描画 / HTML 描画） |
| `vision_source.md` | ビジョンの原稿。**Google NotebookLM のソース**としてそのまま利用可（音声概要・要約など） |

生成スクリプトと検証スクリプトが同一のレイアウト定義を参照するため、
プレビューは実際の pptx と同一の座標・テキスト・フォントサイズで描画されます。

## 使い方

```bash
npm install               # pptxgenjs（生成）/ playwright（検証）

npm run generate          # 光和工業_組織図.pptx を生成
npm run preview           # preview.png を生成し、はみ出しを検査

npm run generate:vision   # 光和工業_ビジョン資料.pptx（10枚）を生成
npm run preview:vision    # vision_slideNN.png を生成し、はみ出しを検査
```

## デザイン

- **配色**: Forest & Moss 系（メイン緑 `2C5F2D` / スレート `36454F` / 背景クリーム `F5F5F2`）
- **事業部カラー**: 積水 `1C7293` / ランドリー `C9742E` / サウナ `8C3B4A` / ウェルネス `5B8C5A` / 飲食 `B07A3E`
- **フォント**: 環境依存を避け、タイトルのみ Cambria・他はデフォルト

## レイアウト検証について

本リポジトリの想定環境では LibreOffice の headless 変換が
サンドボックス制約（setrlimit 不可 / soffice.bin が exit 81）で動作しないため、
PDF 化の代替として **Chromium による同一座標レンダリング**で
文字のはみ出し・要素の重なりを確認しています（`preview.png`）。
LibreOffice が利用可能な環境では次のコマンドで PDF 化できます。

```bash
libreoffice --headless --convert-to pdf 光和工業_組織図.pptx
```
