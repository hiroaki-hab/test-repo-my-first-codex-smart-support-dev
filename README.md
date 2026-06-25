# 有限会社 光和工業 組織図ジェネレーター

`pptxgenjs` を使って、有限会社 光和工業の組織図（16:9 ワイド・1枚スライド）の
PowerPoint を生成する Node.js スクリプトです。

## 構成

| ファイル | 役割 |
| --- | --- |
| `layout.js` | 配色・座標・所属など全レイアウトを **プリミティブ**(rect/text/line) として定義した共有モデル |
| `generate_org_chart.js` | `layout.js` から `光和工業_組織図.pptx` を生成 |
| `preview.js` | `layout.js` を 96dpi の HTML として Chromium で描画し、`preview.png` を出力＋テキストはみ出しを自動検査 |

`generate_org_chart.js` と `preview.js` が同一の `layout.js` を参照するため、
プレビューは実際の pptx と同一の座標・テキスト・フォントサイズで描画されます。

## 使い方

```bash
npm install            # pptxgenjs（生成）/ playwright（検証）
npm run generate       # 光和工業_組織図.pptx を生成
npm run preview        # preview.png を生成し、はみ出しを検査
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
