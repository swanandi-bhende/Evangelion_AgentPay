import { DynamicTool } from "@langchain/core/tools";
import { hederaService } from "../../hederaService.ts";
import { getEnvVars } from "../../../utils/env";

/**
 * Tool for transferring tokens on Hedera network
 */
export function createTransferTool(): DynamicTool {
  return new DynamicTool({
    name: "hedera_token_transfer",
    description: `Use this tool to transfer a specified amount of TPYUSD tokens from the sender to a receiver on the Hedera network.

Input should be a JSON object with:
- amount: number (how many TPYUSD to send)
- receiverId: string (Hedera account ID, e.g., "0.0.12345")

OR a plain string like: "Send 10 TPYUSD to 0.0.12345"

Example JSON input: {"amount": 10, "receiverId": "0.0.12345"}`,

    func: async (input: string) => {
      try {
        console.log("🛠️ Transfer tool input:", input);

        let amount: number | null = null;
        let receiverId: string | null = null;

        // Try to parse input as JSON first
        try {
          const parsedInput = JSON.parse(input);
          amount = parsedInput.amount;
          receiverId = parsedInput.receiverId;
        } catch {
          // If not JSON, try to parse plain English string
          const regex = /(\d+(?:\.\d+)?)\s*TPYUSD\s*to\s*(0\.0\.\d+)/i;
          const match = input.match(regex);
          if (match) {
            amount = Number(match[1]);
            receiverId = match[2];
          }
        }

        // Validate extracted values
        if (amount === null || receiverId === null) {
          return `❌ Invalid input format. Provide JSON like {"amount":10,"receiverId":"0.0.12345"} or a string like "Send 10 TPYUSD to 0.0.12345".`;
        }

        if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
          return `❌ Amount must be a positive number.`;
        }

        if (!/^0\.0\.\d+$/.test(receiverId)) {
          return `❌ Invalid Hedera account ID format. Use "0.0.xxxxxx".`;
        }

        const env = getEnvVars();

        const result = await hederaService.transferTokens(
          env.senderAccountId,
          env.senderPrivateKey,
          receiverId,
          env.tokenId,
          amount
        );

        if (result.success && result.transactionId) {
          const txUrl = `https://hashscan.io/testnet/transaction/${result.transactionId}`;
          return `✅ Successfully transferred ${amount} TPYUSD to ${receiverId}.

Transaction ID: ${result.transactionId}
View on Explorer: ${txUrl}`;
        } else {
          return `❌ Transfer failed: ${result.error || "Unknown error"}`;
        }
      } catch (error) {
        return `❌ Transfer tool error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
      }
    },
  });
}
