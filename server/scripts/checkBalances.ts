import { getEnvVars } from "../utils/env";
import { hederaService } from "../src/services/hederaService";

async function checkBalances() {
  const env = getEnvVars();

  console.log("Fetching live token balances...");

  const senderBalance = await hederaService.getTokenBalance(env.senderAccountId, env.tokenId);
  const recipientBalance = await hederaService.getTokenBalance(env.recipientAccountId, env.tokenId);

  console.log("\nAccount Balances (TPYUSD):");
  console.log(`Sender (${env.senderAccountId}): ${senderBalance} TPYUSD`);
  console.log(`Recipient (${env.recipientAccountId}): ${recipientBalance} TPYUSD`);

  console.log("\n🔗 HashScan URLs:");
  console.log(`Sender: https://hashscan.io/testnet/account/${env.senderAccountId}`);
  console.log(`Recipient: https://hashscan.io/testnet/account/${env.recipientAccountId}`);
  console.log(`Token: https://hashscan.io/testnet/token/${env.tokenId}`);
}

checkBalances();
