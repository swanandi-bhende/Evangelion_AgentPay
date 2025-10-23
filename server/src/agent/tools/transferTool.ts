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

Example: {"amount": 10, "receiverId": "0.0.12345"}`,

    func: async (input: string) => {
      try {
        console.log("🛠️ Transfer tool input:", input);

        let parsedInput;
        try {
          parsedInput = JSON.parse(input);
        } catch {
          return `❌ Invalid input format. Use valid JSON with 'amount' and 'receiverId'.`;
        }

        const { amount, receiverId } = parsedInput;

        if (!amount || !receiverId)
          return `❌ Missing required fields. Provide both 'amount' and 'receiverId'.`;

        if (typeof amount !== "number" || amount <= 0)
          return `❌ Amount must be a positive number.`;

        if (!receiverId.match(/^\d+\.\d+\.\d+$/))
          return `❌ Invalid Hedera account ID format. Use "0.0.xxxxxx".`;

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
        return `❌ Transfer tool error: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }
  });
}
