import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent, DynamicTool } from "langchain";

import { createTransferTool } from "./agent/tools/transferTool.js";
import { createInfoTool } from "./agent/tools/infoTool.js";

dotenv.config();

export class AgentService {
  private agentExecutor: ReturnType<typeof createAgent> | null = null;
  private initializing = false;

  constructor() {
    this.initializeAgent().catch((err) =>
      console.error("Agent initialization failed:", err)
    );
  }

  private async initializeAgent(): Promise<void> {
    if (this.initializing || this.agentExecutor) return;
    this.initializing = true;

    try {
      console.log("🔄 Initializing Gemini Agent...");

      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) throw new Error("Missing GOOGLE_API_KEY environment variable");

      // ✅ Correct property for Gemini API
      const chatModel = new ChatGoogleGenerativeAI({
        apiKey,
        modelName: "gemini-2.5-flash",
        temperature: 0.3,
        maxOutputTokens: 2048,
      }) as any; // 'any' cast needed for createAgent compatibility

      const tools: DynamicTool[] = [
        new DynamicTool({
          name: "transferTool",
          description: "Transfers TPYUSD tokens on the Hedera blockchain.",
          func: async (input: string) => await createTransferTool().func(input),
        }),
        new DynamicTool({
          name: "infoTool",
          description: "Provides general information about the AgentPay system.",
          func: async (input: string) => await createInfoTool().func(input),
        }),
      ];

      this.agentExecutor = await createAgent({
        model: chatModel,
        tools,
      });

      console.log("✅ Gemini Agent initialized successfully.");
    } catch (error) {
      console.error("Error initializing Gemini Agent:", error);
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  private extractReadableResponse(result: any): string {
    if (!result) return "No response received from model.";

    if (typeof result === "string") return result.trim();
    if (typeof result.output === "string") return result.output.trim();
    if (typeof result.content === "string") return result.content.trim();

    if (Array.isArray(result.messages)) {
      const aiMsg = [...result.messages].reverse().find(
        (msg) => msg.id?.[2] === "AIMessage" || msg.id?.includes("AIMessage")
      );

      if (aiMsg) {
        const content = (aiMsg as any)?.kwargs?.content ?? (aiMsg as any)?.content;
        if (typeof content === "string") return content.trim();
        if (Array.isArray(content)) {
          const textParts = content
            .map((part: any) =>
              typeof part === "string"
                ? part
                : part.text || part.functionCall?.name || JSON.stringify(part)
            )
            .join("\n");
          return textParts.trim();
        }
      }
    }

    if (result?.returnValues?.output) return result.returnValues.output.trim();

    return JSON.stringify(result, null, 2);
  }

  async processMessage(message: string): Promise<string> {
    if (!this.agentExecutor) {
      throw new Error("Agent not initialized. Please wait and try again.");
    }

    try {
      console.log("💬 Processing user message:", message);

      const result = await this.agentExecutor.invoke({
        messages: [{ role: "user", content: message }],
      });

      console.log("🧠 Full LangChain output:", JSON.stringify(result, null, 2));

      const readable = this.extractReadableResponse(result);

      console.log("✅ Gemini Agent response complete:", readable);
      return readable;
    } catch (error) {
      console.error("❌ Error during agent execution:", error);
      return `I encountered an error while processing your request.\n\nError: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  isReady(): boolean {
    return this.agentExecutor !== null;
  }
}

export const agentService = new AgentService();
