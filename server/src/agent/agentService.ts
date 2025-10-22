import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { createTransferTool } from "./tools/transferTool";
import { createInfoTool } from "./tools/infoTool";

export class AgentService {
  private agentExecutor: AgentExecutor | null = null;

  constructor() {
    this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      console.log("🤖 Initializing Gemini Agent...");

      // Initialize Gemini model
      const model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY || "", // Ensure fallback
        model: "gemini-pro",                      // Gemini model ID
        temperature: 0,
      });

      // Initialize tools
      const tools = [createTransferTool(), createInfoTool()];

      // Create the function-call-compatible agent
      const agent = await createOpenAIFunctionsAgent({
        llm: model,
        tools,
      });

      // Set up executor
      this.agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: process.env.NODE_ENV === "development",
      });

      console.log("✅ Gemini Agent initialized successfully.");
    } catch (error) {
      console.error("❌ Error initializing Gemini Agent:", error);
      throw error;
    }
  }

  async processMessage(message: string): Promise<string> {
    if (!this.agentExecutor) {
      throw new Error("Agent not initialized.");
    }

    try {
      console.log("💬 Processing user message:", message);

      // Construct prompt
      const systemPrompt = `You are AgentPay, a helpful AI assistant for cross-border payments.

Your role is to help users send TPYUSD tokens on the Hedera blockchain. You can:

1. Transfer TPYUSD tokens to any valid Hedera account ID.
2. Provide information about the system and how to use it.
3. Answer questions about cross-border payments.

Be friendly, clear, and always security-conscious. When transferring funds:
- Confirm the amount and recipient account ID.
- If unclear, ask the user for clarification.
- Never reveal private keys or internal details.
- Always show transaction status and link to HashScan.

Sender Account: ${process.env.SENDER_ACCOUNT_ID}
Token: TPYUSD (Test PayPal USD)
Network: Hedera Testnet

User message: ${message}`;

      const input = { input: systemPrompt };

      const result = await this.agentExecutor.invoke(input);

      console.log("✅ Gemini Agent response complete.");
      return result.output as string;
    } catch (error) {
      console.error("❌ Error during agent execution:", error);

      return `⚠️ I encountered an error while processing your request.\n\nError: ${
        error instanceof Error ? error.message : "Unknown error"
      }\n\nPlease try again or contact support.`;
    }
  }

  isReady(): boolean {
    return this.agentExecutor !== null;
  }
}

// Export singleton instance
export const agentService = new AgentService();
