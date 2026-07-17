# -*- coding: utf-8 -*-
"""
仮工程 push ツール ── 現場支配シートZ「仮工程_受信」タブへ1物件を投げる。

使い方:
    python push_kari_koutei.py 仮工程_明石台石井様_2026-06.json

仕組み:
  - 仮工程JSON（物件 + 工程行）を読み込み、合言葉(secret)を付けてWebhookへPOST。
  - 着地先は専用タブ「仮工程_受信」。メイン台帳は触らない（社長が確認→手で昇格）。

秘密の置き場（コミット禁止・.gitignore済）:
  同フォルダの genba_z.secret.json に下記を保存しておく:
    { "url": "<デプロイしたWebアプリURL>", "secret": "<合言葉>" }
  （環境変数 GENBA_Z_WEBHOOK / GENBA_Z_SECRET があればそちらを優先）
"""
import json
import os
import sys
import urllib.request
import urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
SECRET_FILE = os.path.join(HERE, "genba_z.secret.json")


def load_config():
    url = os.environ.get("GENBA_Z_WEBHOOK")
    secret = os.environ.get("GENBA_Z_SECRET")
    if url and secret:
        return url, secret
    if os.path.exists(SECRET_FILE):
        with open(SECRET_FILE, encoding="utf-8") as f:
            cfg = json.load(f)
        return cfg.get("url"), cfg.get("secret")
    sys.exit(
        "[NG] Webhook設定が見つかりません。\n"
        f"  {SECRET_FILE} に {{\"url\":\"...\",\"secret\":\"...\"}} を保存するか、\n"
        "  環境変数 GENBA_Z_WEBHOOK / GENBA_Z_SECRET を設定してください。"
    )


def main():
    if len(sys.argv) < 2:
        sys.exit("使い方: python push_kari_koutei.py <仮工程JSONファイル>")

    payload_path = sys.argv[1]
    if not os.path.isabs(payload_path):
        payload_path = os.path.join(HERE, payload_path)
    with open(payload_path, encoding="utf-8") as f:
        payload = json.load(f)

    url, secret = load_config()
    if not url or not secret:
        sys.exit("[NG] url か secret が空です。設定を確認してください。")
    payload["secret"] = secret

    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            res_body = res.read().decode("utf-8")
    except urllib.error.URLError as e:
        sys.exit(f"[NG] 送信に失敗: {e}")

    try:
        result = json.loads(res_body)
    except json.JSONDecodeError:
        sys.exit(f"[NG] 応答が不正です（デプロイURL/権限を確認）:\n{res_body[:500]}")

    if result.get("ok"):
        print(
            f"[OK] 「{result.get('bukken')}」を {result.get('sheet')} に "
            f"{result.get('appended')}行 追加しました（状態=仮（未反映））。"
        )
        print("  → シートZの『仮工程_受信』タブを開き、内容を確認してメイン板へ昇格してください。")
    else:
        sys.exit(f"[NG] サーバ側エラー: {result.get('error')}")


if __name__ == "__main__":
    main()
