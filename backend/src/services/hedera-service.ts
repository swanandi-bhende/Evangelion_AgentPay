import {
  Client,
  PrivateKey,
  AccountId,
  TokenId,
  TransferTransaction,
  TransactionReceipt,
  Hbar
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
  ): Promise<string> {
    try {
      const senderAccountId = AccountId.fromString(senderId);
      const senderPrivateKey = PrivateKey.fromStringECDSA(senderKey);
      const receiverAccountId = AccountId.fromString(receiverId);
      const htsTokenId = TokenId.fromString(tokenId);

      this.client.setOperator(senderAccountId, senderPrivateKey);

      const transferTx = new TransferTransaction()
        .addTokenTransfer(htsTokenId, senderAccountId, -amount)
        .addTokenTransfer(htsTokenId, receiverAccountId, amount)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(this.client);

      const transferSign = await transferTx.sign(senderPrivateKey);
      const transferSubmit = await transferSign.execute(this.client);
      const transferRx: TransactionReceipt = await transferSubmit.getReceipt(this.client);

      if (transferRx.status.toString() !== "SUCCESS") {
        throw new Error(`Transaction failed with status: ${transferRx.status.toString()}`);
      }

      return transferSubmit.transactionId.toString();
    } catch (error) {
      console.error("Error in transferTokens:", error);
      throw error;
    }
  }
}

export default HederaService;