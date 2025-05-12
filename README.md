# Deno Local LLM Chat

DenoでローカルLLM（LMStudio API）に接続するシンプルなチャットアプリケーションです。

## 特徴

- Denoを使用したモダンなJavaScriptランタイム
- LMStudio APIを活用したローカルLLMの利用
- シンプルなコマンドラインインターフェース
- ストリーミングレスポンスのサポート

## 必要条件

- [Deno](https://deno.land/manual/getting_started/installation) がインストールされていること
- [LMStudio](https://lmstudio.ai/) がインストールされ、ローカルでAPIサーバーが起動していること

## 使い方

1. LMStudioでローカルAPIサーバーを起動する（デフォルト: http://localhost:1234）
2. このリポジトリをクローンする
3. 以下のコマンドを実行する

```bash
deno run --allow-net --allow-read --allow-env main.ts
```

## 設定

`.env.example`ファイルを`.env`にコピーし、必要に応じてAPIのURLを変更してください。

```
API_URL=http://localhost:1234/v1/chat/completions
```

## ライセンス

MIT