import { DynamicTool } from "@langchain/core/tools";
import { hederaService } from "../../services/hederaService";
import { getEnvVars } from "../../../utils/env";

/**
 * Tool for transferring tokens on Hedera network
 */
export function createTransferTool(): DynamicTool {
  return new DynamicTool({
    name: "hedera_token_transfer",
    description: `Use this tool to transfer a specified amount of TPYUSD tokens from the sender to a receiver on the Hedera network.
    
    Input should be a JSON string with the following properties:
    - amount: number (the amount of TPYUSD to transfer)
    - receiverId: string (the Hedera account ID of the recipient, e.g., "0.0.12345")
    
    Example input: '{"amount": 10, "receiverId": "0.0.12345"}'`,
    
    func: async (input: string) => {
      try {
        console.log("🛠️ Transfer tool called with input:", input);
        
        // Parse the input
        let parsedInput;
        try {
          parsedInput = JSON.parse(input);
        } catch (parseError) {
          return `Error: Invalid input format. Please provide a valid JSON object with 'amount' and 'receiverId' properties.`;
        }

        const { amount, receiverId } = parsedInput;
        
        // Validate input
        if (!amount || !receiverId) {
          return `Error: Missing required parameters. Please provide both 'amount' and 'receiverId'.`;
        }

        if (typeof amount !== 'number' || amount <= 0) {
          return `Error: Amount must be a positive number.`;
        }

        // Validate receiver ID format (basic check)
        if (!receiverId.match(/^\d+\.\d+\.\d+$/)) {
          return `Error: Invalid receiver account ID format. Should be in format "0.0.12345".`;
        }

        // Get environment variables
        const env = getEnvVars();
        
        console.log(`🔄 Transferring ${amount} TPYUSD to ${receiverId}...`);
        
        // Execute the transfer
        const result = await hederaService.transferTokens(
          env.senderAccountId,
          env.senderPrivateKey,
          receiverId,
          env.tokenId,
          amount
        );

        if (result.success && result.transactionId) {
          const hashScanUrl = `https://hashscan.io/testnet/transaction/${result.transactionId}`;
          const response = `✅ Successfully transferred ${amount} TPYUSD to account ${receiverId}.
          
Transaction Details:
- Transaction ID: ${result.transactionId}
- Status: Completed
- Explorer: ${hashScanUrl}

The funds have been sent and should be available in the recipient's account within seconds.`;

          console.log("✅ Transfer completed successfully");
          return response;
        } else {
          const errorMsg = `❌ Transfer failed: ${result.error || 'Unknown error'}`;
          console.error(errorMsg);
          return errorMsg;
        }
        
      } catch (error) {
        const errorMsg = `❌ Unexpected error during transfer: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        return errorMsg;
      }
    }
  });
}