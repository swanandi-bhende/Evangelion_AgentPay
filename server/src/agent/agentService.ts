import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { initializeAgentExecutor } from "langchain/agents";
import type { AgentExecutor } from "langchain/agents";
import { DynamicTool } from "langchain/tools";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts"; 
import { createTransferTool } from "./tools/transferTool.js";
import { createInfoTool } from "./tools/infoTool.js";

export class AgentService {
  private agentExecutor: AgentExecutor | null = null;
  private initializing = false;

  constructor() {
    // Fire-and-forget initialization
    this.initializeAgent().catch((err) =>
      console.error("Agent initialization failed:", err)
    );
  }

  private async initializeAgent(): Promise<void> {
    if (this.initializing || this.agentExecutor) return;
    this.initializing = true;

    try {
      console.log("Initializing Gemini Agent...");

      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) throw new Error("Missing GOOGLE_API_KEY environment variable");

      const chatModel = new ChatGoogleGenerativeAI({
        apiKey,
        model: "gemini-pro",
        temperature: 0.3,
        maxOutputTokens: 2048,
      });

      const prompt = new PromptTemplate({
        template: "{input}",
        inputVariables: ["input"],
      });

      const model = new LLMChain({
        llm: chatModel as any, 
        prompt,
      });

      const tools = [
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

      const executor = await initializeAgentExecutor(
        tools,
        model as any,
        "zero-shot-react-description",
        process.env.NODE_ENV === "development" 
      );

      this.agentExecutor = executor;
      console.log("Gemini Agent initialized successfully.");
    } catch (error) {
      console.error("Error initializing Gemini Agent:", error);
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  async processMessage(message: string): Promise<string> {
    if (!this.agentExecutor) {
      throw new Error("Agent not initialized. Please wait and try again.");
    }

    try {
      console.log("Processing user message:", message);

      const systemPrompt = `You are AgentPay, a helpful AI assistant for cross-border payments.
You help users send TPYUSD tokens on the Hedera blockchain.

Responsibilities:
1. Transfer TPYUSD tokens to valid Hedera account IDs.
2. Provide information about the system and token transfers.
3. Be concise, friendly, and security-conscious.

Guidelines:
- Confirm transfer details (amount & recipient).
- Never reveal private keys or sensitive data.
- Always return clear transaction results with HashScan links.

Environment:
Sender Account: ${process.env.SENDER_ACCOUNT_ID}
Token: TPYUSD (Test PayPal USD)
Network: Hedera Testnet

User message: ${message}`;

      const result = await this.agentExecutor.call({ input: systemPrompt });

      const output =
        (result.output as string) ||
        "I'm sorry, I couldn't generate a response.";

      console.log("Gemini Agent response complete.");
      return output;
    } catch (error) {
      console.error("Error during agent execution:", error);
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