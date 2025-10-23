import { DynamicTool } from "@langchain/core/tools";
import { getEnvVars } from "../../../utils/env";

/**
 * Tool for providing information about the system
 */
export function createInfoTool(): DynamicTool {
  return new DynamicTool({
    name: "system_information",
    description: `Use this tool to provide help and system information.
    
Input should be an empty string or "help".`,

    func: async () => {
      const env = getEnvVars();

      return `📘 **AgentPay - AI-Powered Remittance Assistant**

**Capabilities:**
- ✅ Send TPYUSD tokens via the Hedera blockchain
- ℹ️ Provide help and system information

**How to Use:**
- "Send 10 TPYUSD to 0.0.1234567"
- "What can you do?"
- "Help"

**System Info:**
- Network: Hedera Testnet
- Sender Account: ${env.senderAccountId}
- Token: TPYUSD (Test PayPal USD)

🔍 Check balance or history: https://hashscan.io/testnet/account/${env.senderAccountId}`;
    },
  });
}
