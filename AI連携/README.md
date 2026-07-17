# AI連携 土台（光和グループ）

> 目的：**いろいろなAIを「キーを貼るだけ」で繋げる状態**を作っておく置き場。
> 社長方針どおり「Claudeに毎回考えさせる」のではなく「**Claudeが書いたコードに実行させる**」形。
> セキュリティ厳守：**APIキーは絶対にコミットしない**（`.env` は `.gitignore` 済）。

---

## 1. いまの接続状況（2026-06-15 確認）

| AI / サービス | 状態 | 必要な作業 | お金 |
|---|---|---|---|
| **Notion**（議事録の読み書き） | 🟢 登録済み・**未ログイン** | Claude Codeで `/mcp` → Notion → ブラウザでログイン承認 | 無料 |
| **Canva**（画像・デザイン） | 🟢 接続済み | なし（今すぐ使える） | Canvaの範囲 |
| **Gmail / カレンダー / Drive / Box** | 🟢 接続済み | なし | 無料 |
| **ChatGPT 画像生成**（gpt-image-1） | 🟡 スクリプト用意済 | `.env` に `OPENAI_API_KEY` を貼る | 1枚 約1〜25円 |
| **Gemini 画像生成**（Nano Banana） | 🟡 スクリプト用意済 | `.env` に `GEMINI_API_KEY` を貼る | 1枚 約1〜40円 |
| **Manus**（専門資料まとめ） | 🟡 スクリプト用意済 | `.env` に `MANUS_API_KEY` を貼る | $20/月〜（クレジット制） |

> ⚠️ 料金は2026-06時点の目安。改定が速いので契約直前に公式で再確認します。

---

## 2. 使えるようにする手順（5分）

### A. キーを貼る
1. `.env.example` をコピーして同じフォルダに `.env` を作る。
2. 取りに行ったキーを `.env` に貼る（下のリンク参照）。要らないAIは空のままでOK。

| キー | 取得先 |
|---|---|
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey |
| `MANUS_API_KEY` | Manus → 設定(Settings) → Integration → 「Build with Manus API」 |

### B. 必要なライブラリを入れる（初回だけ）
```powershell
C:\Users\User\AppData\Local\Programs\Python\Python313\python.exe -m pip install -r "C:\test-repo-my-first-codex-smart-support-dev\AI連携\requirements.txt"
```

### C. 動かす（例）
```powershell
# ChatGPTで画像を1枚生成（out\ に保存）
python "AI連携\gen_image_openai.py" "サウナ KÖWA の落ち着いた外観、夕方、和モダン、写真調"

# Geminiで画像を1枚生成（日本語の文字入れに強い）
python "AI連携\gen_image_gemini.py" "ホテル向けブレインスリープ訴求バナー、日本語コピー入り"

# Manusに専門資料の作成を依頼
python "AI連携\manus_task.py" "コインランドリー出店の市場性を3ページで要約して"
```

---

## 3. 画像はどっちを使う？（裏取り済みの結論）

- **日本語の文字入れ・写真のリアルさ** → **Gemini（Nano Banana Pro）が優勢**。サウナ/ホテルのDM・インスタ画像はこちら推し。
- **「ここだけ直す」狙い撃ち編集・指示の忠実さ** → **OpenAI（gpt-image）が優勢**。
- ざっくり試すだけなら、まず安いティア（`gpt-image-1-mini` / `gemini-2.5-flash-image`）でOK。

---

## 4. note（ノート）で収益化したい場合 ★要確認

「ノート収益」= **note.com（note株式会社）で記事を売る/メンバーシップで稼ぐ** と解釈しています。

- ✅ **記事・画像をAIで量産する**のは得意（ここまでは全自動にできる）。
- ⚠️ **note.com には公式の「投稿API」が無い**（私の知る限り 2026時点）。
  そのため**投稿の自動化はできず**、現実的には次のどちらか：
  1. **AIが下書き完成 → 社長がコピペで投稿**（安全・確実）
  2. **Chrome操作（claude-in-chrome）で半自動投稿**（動くが画面変更に弱い）
- 本気で進めるなら、note最新の連携可否を**改めて裏取り**してから設計します。

---

## 5. セキュリティ（厳守）
- `.env` は **絶対にコミットしない**（このフォルダの `.gitignore` で除外済）。
- 生成画像 `out/` もリポジトリに入れない設定。
- 困ったらこのREADMEと各スクリプト冒頭のコメントを参照。
