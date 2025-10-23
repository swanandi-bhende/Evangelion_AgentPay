import { hederaService } from "../src/services/hederaService.js";
import { getEnvVars } from "../utils/env.js";


async function testTransfer() {
  console.log("Starting test transfer...");
  
  try {
    const env = getEnvVars();
    
    // Test parameters
    const amount = 10; // 10 TPYUSD
    
    console.log("\nTest Parameters:");
    console.log(`Sender: ${env.senderAccountId}`);
    console.log(`Recipient: ${env.recipientAccountId}`);
    console.log(`Token: ${env.tokenId}`);
    console.log(`Amount: ${amount} TPYUSD`);
    
    console.log("\nExecuting transfer...");
    
    // Execute the transfer
    const result = await hederaService.transferTokens(
      env.senderAccountId,
      env.senderPrivateKey,
      env.recipientAccountId,
      env.tokenId,
      amount
    );
    
    if (result.success && result.transactionId) {
      console.log("\nTEST PASSED!");
      console.log(`Transaction ID: ${result.transactionId}`);
      console.log(`HashScan URL: https://hashscan.io/testnet/transaction/${result.transactionId}`);
      
      // Return success for scripting
      process.exit(0);
    } else {
      console.log("\nTEST FAILED!");
      console.log(`Error: ${result.error}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error("Test script error:", error);
    process.exit(1);
  }
}

// Run the test
testTransfer();