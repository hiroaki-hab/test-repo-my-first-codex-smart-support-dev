"""Manus(専門資料まとめ)にタスクを依頼して結果を表示する。

使い方:
    python manus_task.py "依頼内容"

キー: .env の MANUS_API_KEY（ベースURLは MANUS_BASE_URL）

実装メモ(正直に):
- ここでは Manus の「OpenAI SDK 互換」エンドポイントを使っています(最も手軽・裏取り済み)。
- 図表ファイルや PDF 等の"成果物ファイル"まで受け取る本格運用は、Manus 公式 REST の
  タスクAPI(createTask → Webhook/ポーリングでファイル取得)に切り替えるのが本筋です。
    公式API: https://open.manus.im/docs / https://manus.im/docs/integrations/manus-api
- ⚠️ 初回はエンドポイント・モデル名(manus-1.6 等)が変わっていないか公式で要確認。
"""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))


def main():
    if len(sys.argv) < 2:
        print('使い方: python manus_task.py "依頼内容"')
        sys.exit(1)

    task = sys.argv[1]
    api_key = os.getenv("MANUS_API_KEY")
    base_url = os.getenv("MANUS_BASE_URL", "https://api.manus.ai/v1")

    if not api_key:
        print("⚠️ MANUS_API_KEY が未設定です。.env に貼ってください。")
        sys.exit(1)

    from openai import OpenAI

    client = OpenAI(api_key=api_key, base_url=base_url)
    resp = client.chat.completions.create(
        model="manus-1.6",
        messages=[{"role": "user", "content": task}],
    )
    print(resp.choices[0].message.content)


if __name__ == "__main__":
    main()
