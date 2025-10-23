import {
  Client,
  PrivateKey,
  TransferTransaction,
  TransactionReceipt,
  Hbar,
  AccountId,
  TokenId,
  AccountBalanceQuery
} from "@hashgraph/sdk";
import { getEnvVars } from "../utils/env.ts";  // <-- fixed import path with .js

export interface TransferResult {
  success: boolean;
  transactionId?: string;
  receipt?: TransactionReceipt;
  error?: string;
}

export class HederaService {
  /**
   * Transfer HTS tokens between accounts
   */
  async transferTokens(
    senderId: string,
    senderPrivateKey: string,
    receiverId: string,
    tokenId: string,
    amount: number
  ): Promise<TransferResult> {
    try {
      // Load sender private key as ECDSA
      const senderPrivateKeyObj = PrivateKey.fromStringECDSA(senderPrivateKey);

      // Create a fresh Hedera client with sender as operator
      const client = Client.forTestnet();
      client.setOperator(senderId, senderPrivateKeyObj);

      console.log(`Initiating transfer of ${amount} tokens...`);
      console.log(`From: ${senderId} | To: ${receiverId} | Token: ${tokenId}`);

      // Create the token transfer transaction
      const transaction = new TransferTransaction()
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(senderId), -amount * 100) // 2 decimal precision
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(receiverId), amount * 100)
        .setMaxTransactionFee(new Hbar(1))
        .freezeWith(client);

      // Sign the transaction with sender's private key
      const signedTransaction = await transaction.sign(senderPrivateKeyObj);

      // Execute the transaction
      const response = await signedTransaction.execute(client);

      // Get the receipt to confirm success
      const receipt = await response.getReceipt(client);

      console.log("Transfer successful!");
      console.log("Transaction ID:", response.transactionId.toString());
      console.log("Status:", receipt.status.toString());

      return {
        success: receipt.status.toString() === "SUCCESS",
        transactionId: response.transactionId.toString(),
        receipt
      };

    } catch (error) {
      console.error("Transfer failed:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  /**
   * Get token balance using AccountBalanceQuery
   */
  async getTokenBalance(accountId: string, tokenId: string): Promise<number> {
    try {
      const client = Client.forTestnet();

      const balance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client);

      const tokenBalances = balance.tokens;
      const tokenIdObj = TokenId.fromString(tokenId);

      // Safely retrieve the token balance
      const tokenBalance = tokenBalances?.get(tokenIdObj);
      return tokenBalance ? tokenBalance.toNumber() / 100 : 0;

    } catch (error) {
      console.error("Balance check failed:", error);
      return 0;
    }
  }
}

// Export a singleton instance
export const hederaService = new HederaService();
