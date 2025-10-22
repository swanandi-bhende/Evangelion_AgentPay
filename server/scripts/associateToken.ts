import {
  Client,
  PrivateKey,
  TokenAssociateTransaction,
  Status
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

async function associateTokenToRecipient() {
  const client = Client.forTestnet();
  const recipientId = process.env.RECIPIENT_ACCOUNT_ID!;
  const recipientKey = PrivateKey.fromStringECDSA(process.env.RECIPIENT_PRIVATE_KEY!);
  const tokenId = process.env.TOKEN_ID!;

  client.setOperator(recipientId, recipientKey);

  try {
    const transaction = new TokenAssociateTransaction()
      .setAccountId(recipientId)
      .setTokenIds([tokenId])
      .freezeWith(client);

    const signedTx = await transaction.sign(recipientKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);

    console.log("Token associated successfully with recipient!");
    console.log("Transaction status:", receipt.status.toString());
  } catch (error: any) {
    if (error.status === Status.TokenAlreadyAssociatedToAccount) {
      console.log("Token already associated with this account, skipping.");
    } else {
      console.error("Token association failed:", error);
      throw error;
    }
  }
}

associateTokenToRecipient()
  .then(() => {
    console.log("Association complete!");
    process.exit(0);
  })
  .catch(error => {
    console.error("Association failed:", error);
    process.exit(1);
  });
