import { getEnvVars } from "../../utils/env.js";
import { hederaService } from "../hederaService.ts";

/**
 * Simple rule-based agent as fallback
 */
export class SimpleAgent {
  /**
   * Process message with simple pattern matching
   */
  async processMessage(message: string): Promise<string> {
    console.log("Simple agent processing:", message);
    
    const lowerMessage = message.toLowerCase().trim();
    
    // Help command
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return this.getHelpResponse();
    }
    
    // Transfer command
    const transferMatch = lowerMessage.match(/send\s+(\d+(?:\.\d+)?)\s*tpyusd\s+to\s+(\d+\.\d+\.\d+)/i);
    if (transferMatch) {
      const amount = parseFloat(transferMatch[1]);
      const receiverId = transferMatch[2];
      return await this.handleTransfer(amount, receiverId);
    }
    
    // Alternative transfer pattern
    const altTransferMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*tpyusd\s+to\s+(\d+\.\d+\.\d+)/i);
    if (altTransferMatch) {
      const amount = parseFloat(altTransferMatch[1]);
      const receiverId = altTransferMatch[2];
      return await this.handleTransfer(amount, receiverId);
    }
    
    // Default response
    return `I understand you want to: "${message}"
    
I can help you send TPYUSD tokens to any Hedera account. Try saying:
"Send 10 TPYUSD to 0.0.1234567"

Or type "help" to see all available commands.`;
  }
  
  private async handleTransfer(amount: number, receiverId: string): Promise<string> {
    try {
      const env = getEnvVars();
      
      console.log(`Processing transfer: ${amount} TPYUSD to ${receiverId}`);
      
      const result = await hederaService.transferTokens(
        env.senderAccountId,
        env.senderPrivateKey,
        receiverId,
        env.tokenId,
        amount
      );
      
      if (result.success && result.transactionId) {
        const hashScanUrl = `https://hashscan.io/testnet/transaction/${result.transactionId}`;
        return `Success! I've sent ${amount} TPYUSD to ${receiverId}.

Transaction Details:
• Amount: ${amount} TPYUSD
• To: ${receiverId}
• Transaction ID: ${result.transactionId}
• Explorer: ${hashScanUrl}

The transfer is complete and the funds should be available immediately.`;
      } else {
        return `Sorry, the transfer failed: ${result.error || 'Unknown error'}`;
      }
    } catch (error) {
      return `Transfer error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
  
  private getHelpResponse(): string {
    const env = getEnvVars();
    
    return `**AgentPay Help**

I can help you send TPYUSD tokens on the Hedera Testnet.

**Available Commands:**
• "Send [amount] TPYUSD to [account ID]" - Transfer tokens
• "Help" - Show this message

**Examples:**
• "Send 10 TPYUSD to 0.0.1234567"
• "Send 5.5 TPYUSD to ${env.recipientAccountId}"

**Current Setup:**
• Sender: ${env.senderAccountId}
• Token: TPYUSD
• Network: Hedera Testnet

All transactions are on testnet - no real money is involved!`;
  }
}

export const simpleAgent = new SimpleAgent();
