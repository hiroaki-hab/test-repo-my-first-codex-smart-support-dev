"""Gemini(Nano Banana)で画像を生成して out/ に保存する。

使い方:
    python gen_image_gemini.py "プロンプト" [モデル]
      モデル : gemini-2.5-flash-image(既定・安い)
             / gemini-3-pro-image(高品質・日本語の文字入れに強い)

費用目安(2026-06): 1枚 約6円(flash)〜40円(pro)。⚠️要公式再確認。
キー: .env の GEMINI_API_KEY
注意: 生成画像には SynthID 透かしが自動付与されます。
"""
import os
import sys
import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))


def main():
    if len(sys.argv) < 2:
        print('使い方: python gen_image_gemini.py "プロンプト" [モデル]')
        sys.exit(1)

    prompt = sys.argv[1]
    model = sys.argv[2] if len(sys.argv) > 2 else "gemini-2.5-flash-image"

    if not os.getenv("GEMINI_API_KEY"):
        print("⚠️ GEMINI_API_KEY が未設定です。.env に貼ってください。")
        sys.exit(1)

    from google import genai
    from google.genai import types

    client = genai.Client()  # GEMINI_API_KEY を環境変数から読む
    resp = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
    )

    out_dir = Path(__file__).with_name("out")
    out_dir.mkdir(exist_ok=True)
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    saved = 0
    for part in resp.candidates[0].content.parts:
        if getattr(part, "inline_data", None) and part.inline_data.data:
            out_path = out_dir / f"gemini_{ts}_{saved}.png"
            out_path.write_bytes(part.inline_data.data)
            print(f"✅ 保存しました: {out_path}")
            saved += 1
        elif getattr(part, "text", None):
            print(f"(モデルのコメント) {part.text}")

    if saved == 0:
        print("⚠️ 画像が返りませんでした。プロンプトやモデル名を確認してください。")


if __name__ == "__main__":
    main()
