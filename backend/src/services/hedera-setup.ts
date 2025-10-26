import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  AccountBalanceQuery
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

class HederaSetup {
  private client: Client;

  constructor() {
    this.client = Client.forTestnet();
  }

  async setupTestEnvironment() {
    try {
      const senderAccountId = AccountId.fromString(process.env.SENDER_ACCOUNT_ID!);
      const senderPrivateKey = PrivateKey.fromStringECDSA(process.env.SENDER_PRIVATE_KEY!);

      this.client.setOperator(senderAccountId, senderPrivateKey);

      console.log("Setting up test environment with ECDSA keys...");

      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName("Test PYUSD")
        .setTokenSymbol("TPYUSD")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(1000000)
        .setTreasuryAccountId(senderAccountId)
        .setSupplyType(TokenSupplyType.Infinite)
        .setMaxTransactionFee(new Hbar(30))
        .freezeWith(this.client);

      const tokenCreateSign = await tokenCreateTx.sign(senderPrivateKey);
      const tokenCreateSubmit = await tokenCreateSign.execute(this.client);
      const tokenCreateRx = await tokenCreateSubmit.getReceipt(this.client);
      const tokenId = tokenCreateRx.tokenId;

      console.log(`Created test token: ${tokenId}`);

      const recipientAccountId = AccountId.fromString(process.env.RECIPIENT_ACCOUNT_ID!);
      
      console.log("Test environment setup completed!");
      
      return {
        tokenId: tokenId?.toString(),
        senderAccountId: senderAccountId.toString(),
        recipientAccountId: recipientAccountId.toString()
      };

    } catch (error) {
      console.error("Error setting up test environment:", error);
      throw error;
    }
  }

  async checkBalances() {
    try {
      const senderAccountId = AccountId.fromString(process.env.SENDER_ACCOUNT_ID!);
      const senderPrivateKey = PrivateKey.fromStringECDSA(process.env.SENDER_PRIVATE_KEY!);
      
      this.client.setOperator(senderAccountId, senderPrivateKey);

      const senderBalance = await new AccountBalanceQuery()
        .setAccountId(senderAccountId)
        .execute(this.client);

      console.log(`Sender Account: ${senderAccountId}`);
      console.log(`HBAR Balance: ${senderBalance.hbars.toString()}`);
      console.log(`Tokens:`, senderBalance.tokens?.toString());

      return {
        senderAccount: senderAccountId.toString(),
        hbarBalance: senderBalance.hbars.toString(),
        tokens: senderBalance.tokens?.toString()
      };
    } catch (error) {
      console.error("Error checking balances:", error);
      throw error;
    }
  }
}

if (require.main === module) {
  const setup = new HederaSetup();
  setup.setupTestEnvironment()
    .then(result => {
      console.log("Setup result:", result);
      console.log("Day 1 setup completed successfully!");
      console.log("Update your .env file with the TOKEN_ID:", result.tokenId);
    })
    .catch(error => {
      console.error("Setup failed:", error);
      process.exit(1);
    });
}

export default HederaSetup;