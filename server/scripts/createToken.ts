import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

async function createTestToken() {
  // Configure client
  const client = Client.forTestnet();
  const operatorId = process.env.SENDER_ACCOUNT_ID!;
  const operatorKey = PrivateKey.fromStringECDSA(process.env.SENDER_PRIVATE_KEY!);
  client.setOperator(operatorId, operatorKey);

  try {
    // Create token transaction
    const transaction = new TokenCreateTransaction()
      .setTokenName("Test PYUSD")
      .setTokenSymbol("TPYUSD")
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(2)
      .setInitialSupply(1000000) // 10,000.00 TPYUSD
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(operatorKey)
      .freezeWith(client);

    // Sign and execute
    const signedTx = await transaction.sign(operatorKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);

    console.log("Token created successfully!");
    console.log("Token ID:", receipt.tokenId!.toString());
    
    return receipt.tokenId!.toString();
  } catch (error) {
    console.error("Token creation failed:", error);
    throw error;
  }
}

// Run the script
createTestToken()
  .then(tokenId => {
    console.log("\nToken creation complete!");
    console.log("Add this to your .env file:");
    console.log(`TOKEN_ID=${tokenId}`);
    process.exit(0);
  })
  .catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
  });
