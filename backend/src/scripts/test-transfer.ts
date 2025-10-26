import HederaService from '../services/hedera-service';
import dotenv from 'dotenv';

dotenv.config();

async function testTransfer() {
  try {
    const hederaService = new HederaService();
    
    const senderAccountId = process.env.SENDER_ACCOUNT_ID!;
    const senderPrivateKey = process.env.SENDER_PRIVATE_KEY!;
    const recipientAccountId = process.env.RECIPIENT_ACCOUNT_ID!;
    const tokenId = process.env.TOKEN_ID!;

    console.log("Starting test transfer...");
    console.log(`Sender: ${senderAccountId}`);
    console.log(`Recipient: ${recipientAccountId}`);
    console.log(`Token: ${tokenId}`);

    // Transfer 10 TPYUSD (1000 smallest units since we have 2 decimals)
    const amount = 1000;

    const result = await hederaService.transferTokens(
      senderAccountId,
      senderPrivateKey,
      recipientAccountId,
      tokenId,
      amount
    );

    console.log("Test transfer completed successfully!");
    console.log("Transaction ID:", result.transactionId);
    console.log("Status:", result.status);
    
    // Construct HashScan URL for easy verification
    const hashScanUrl = `https://hashscan.io/testnet/transaction/${result.transactionId}`;
    console.log("Verify on HashScan:", hashScanUrl);

    return result;
  } catch (error) {
    console.error("Test transfer failed:", error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testTransfer()
    .then(() => {
      console.log("Test transfer script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test transfer script failed:", error);
      process.exit(1);
    });
}

export default testTransfer;