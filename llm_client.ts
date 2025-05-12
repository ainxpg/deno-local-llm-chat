import { delay } from "./deps.ts";

// チャットメッセージの型定義
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// ストリーミングレスポンスのための型定義
interface LLMChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    index: number;
    finish_reason: null | string;
  }[];
}

export class LLMClient {
  private apiUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(
    apiUrl: string,
    model = "local-model",
    temperature = 0.7,
    maxTokens = 2000
  ) {
    this.apiUrl = apiUrl;
    this.model = model;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
  }

  // LLMにメッセージを送信し、ストリーミングレスポンスを取得する
  async streamChat(
    messages: ChatMessage[],
    onChunk: (text: string) => void
  ): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk
          .split("\n")
          .filter((line) => line.trim() !== "" && line.trim() !== "data: [DONE]");

        for (const line of lines) {
          try {
            // APIのレスポンスからデータ部分を抽出
            const jsonStr = line.replace(/^data: /, "").trim();
            if (!jsonStr) continue;

            const data = JSON.parse(jsonStr) as LLMChunk;
            const content = data.choices[0]?.delta?.content || "";

            if (content) {
              responseText += content;
              onChunk(content);
              // 自然なタイピング感を出すために少し遅延
              await delay(10);
            }
          } catch (e) {
            console.error("Error parsing chunk:", e);
          }
        }
      }

      return responseText;
    } catch (error) {
      console.error("Error in streamChat:", error);
      throw error;
    }
  }

  // ストリーミングなしで単純なレスポンスを取得する
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error in chat:", error);
      throw error;
    }
  }
}