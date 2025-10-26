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
import { getEnvVars } from "./utils/env.js";

export interface TransferResult {
  success: boolean;
  transactionId?: string;
  receipt?: TransactionReceipt;
  error?: string;
}

export class HederaService {
  async transferTokens(
    senderId: string,
    senderPrivateKey: string,
    receiverId: string,
    tokenId: string,
    amount: number
  ): Promise<TransferResult> {
    try {
      const senderKeyObj = PrivateKey.fromString(senderPrivateKey); // ED25519 preferred

      const client = Client.forTestnet();
      client.setOperator(senderId, senderKeyObj);

      console.log(`Initiating transfer of ${amount} tokens...`);
      console.log(`From: ${senderId} | To: ${receiverId} | Token: ${tokenId}`);

      const transaction = new TransferTransaction()
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(senderId), -amount * 100)
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(receiverId), amount * 100)
        .setMaxTransactionFee(new Hbar(1))
        .freezeWith(client);

      const signedTx = await transaction.sign(senderKeyObj);
      const response = await signedTx.execute(client);
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
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getTokenBalance(accountId: string, tokenId: string): Promise<number> {
    try {
      const client = Client.forTestnet();

      const balance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client);

      const tokenBalances = balance.tokens;
      const tokenIdObj = TokenId.fromString(tokenId);

      const tokenBalance = tokenBalances?.get(tokenIdObj);
      return tokenBalance ? tokenBalance.toNumber() / 100 : 0;

    } catch (error) {
      console.error("Balance check failed:", error);
      return 0;
    }
  }
}

export const hederaService = new HederaService();
