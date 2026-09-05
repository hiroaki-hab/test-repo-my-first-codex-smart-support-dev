"""ChatGPT(OpenAI gpt-image-1)で画像を1枚生成して out/ に保存する。

使い方:
    python gen_image_openai.py "プロンプト" [サイズ] [品質]
      サイズ : 1024x1024(既定) / 1536x1024 / 1024x1536
      品質   : low / medium(既定) / high

費用目安(2026-06): 1枚 約1〜25円(品質・サイズで変動)。⚠️要公式再確認。
キー: .env の OPENAI_API_KEY
"""
import os
import sys
import base64
import datetime
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))


def main():
    if len(sys.argv) < 2:
        print('使い方: python gen_image_openai.py "プロンプト" [サイズ] [品質]')
        sys.exit(1)

    prompt = sys.argv[1]
    size = sys.argv[2] if len(sys.argv) > 2 else "1024x1024"
    quality = sys.argv[3] if len(sys.argv) > 3 else "medium"

    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️ OPENAI_API_KEY が未設定です。.env に貼ってください。")
        sys.exit(1)

    from openai import OpenAI

    client = OpenAI()  # OPENAI_API_KEY を環境変数から読む
    result = client.images.generate(
        model="gpt-image-1", prompt=prompt, size=size, quality=quality
    )

    out_dir = Path(__file__).with_name("out")
    out_dir.mkdir(exist_ok=True)
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = out_dir / f"openai_{ts}.png"
    out_path.write_bytes(base64.b64decode(result.data[0].b64_json))
    print(f"✅ 保存しました: {out_path}")


if __name__ == "__main__":
    main()
