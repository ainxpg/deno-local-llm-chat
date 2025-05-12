import { load, colors, readLines } from "./deps.ts";
import { LLMClient, ChatMessage } from "./llm_client.ts";

// 環境変数の読み込み
const env = await load();
const API_URL = env["API_URL"] || "http://localhost:1234/v1/chat/completions";

// チャット履歴を保持する配列
const chatHistory: ChatMessage[] = [];

// システムメッセージの設定
const systemMessage: ChatMessage = {
  role: "system",
  content: "あなたは役立つAIアシスタントです。ユーザーの質問に簡潔かつ丁寧に回答してください。",
};
chatHistory.push(systemMessage);

// LLMクライアントの初期化
const llmClient = new LLMClient(
  API_URL,
  "local-model", // モデル名（LMStudioでは通常無視される）
  0.7, // 温度パラメータ
  2000 // 最大トークン数
);

// ターミナルからの入力読み取り用オブジェクト
const reader = readLines(Deno.stdin);

// 起動メッセージの表示
console.log(colors.green("=== ローカルLLMチャットアプリ ==="));
console.log(colors.yellow("終了するには 'exit' または 'quit' と入力してください"));
console.log(colors.cyan("API URL:"), API_URL);
console.log("");

// メインのチャットループ
async function startChat() {
  try {
    for await (const line of reader) {
      // 終了コマンドの確認
      if (line.toLowerCase() === "exit" || line.toLowerCase() === "quit") {
        console.log(colors.yellow("チャットを終了します。お疲れ様でした！"));
        break;
      }

      // ユーザーの入力をチャット履歴に追加
      const userMessage: ChatMessage = {
        role: "user",
        content: line,
      };
      chatHistory.push(userMessage);

      // ユーザー入力の表示
      console.log(colors.green("あなた: ") + line);
      console.log(colors.blue("AI: "), "");

      try {
        // LLMからのレスポンスをストリーミングで取得
        const response = await llmClient.streamChat(chatHistory, (chunk) => {
          // 文字単位で出力
          Deno.stdout.writeSync(new TextEncoder().encode(chunk));
        });

        // 改行を入れる
        console.log("\n");

        // アシスタントの応答をチャット履歴に追加
        chatHistory.push({
          role: "assistant",
          content: response,
        });
      } catch (error) {
        console.error(colors.red("エラーが発生しました:"), error.message);
      }
    }
  } catch (error) {
    console.error(colors.red("予期しないエラーが発生しました:"), error);
  }
}

// チャットの開始
await startChat();
