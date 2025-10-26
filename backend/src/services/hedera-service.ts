import {
  Client,
  PrivateKey,
  AccountId,
  TokenId,
  TransferTransaction,
  TransactionReceipt,
  Hbar,
  TransactionResponse
} from "@hashgraph/sdk";

class HederaService {
  private client: Client;

  constructor() {
    this.client = Client.forTestnet();
  }

  async transferTokens(
    senderId: string, 
    senderKey: string, 
    receiverId: string, 
    tokenId: string, 
    amount: number
  ): Promise<{ transactionId: string; status: string }> {
    try {
      const senderAccountId = AccountId.fromString(senderId);
      const senderPrivateKey = PrivateKey.fromStringECDSA(senderKey);
      const receiverAccountId = AccountId.fromString(receiverId);
      const htsTokenId = TokenId.fromString(tokenId);

      this.client.setOperator(senderAccountId, senderPrivateKey);

      console.log(`Initiating transfer of ${amount} TPYUSD from ${senderId} to ${receiverId}`);

      const transferTx = new TransferTransaction()
        .addTokenTransfer(htsTokenId, senderAccountId, -amount)
        .addTokenTransfer(htsTokenId, receiverAccountId, amount)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(this.client);

      const transferSign = await transferTx.sign(senderPrivateKey);
      const transferSubmit: TransactionResponse = await transferSign.execute(this.client);
      const transferRx: TransactionReceipt = await transferSubmit.getReceipt(this.client);

      const transactionId = transferSubmit.transactionId.toString();
      const status = transferRx.status.toString();

      console.log(`Transfer completed: ${transactionId}, Status: ${status}`);

      return {
        transactionId,
        status
      };
    } catch (error) {
      console.error("Error in transferTokens:", error);
      throw new Error(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTransactionStatus(transactionId: string): Promise<string> {
    try {
      // This is a simplified status check - in real implementation, 
      // you'd query the network for transaction status
      return "SUCCESS";
    } catch (error) {
      console.error("Error checking transaction status:", error);
      throw error;
    }
  }
}

export default HederaService;