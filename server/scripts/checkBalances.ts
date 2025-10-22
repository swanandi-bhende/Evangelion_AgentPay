import { getEnvVars } from "../utils/env";

async function checkBalances() {
  const env = getEnvVars();
  
  console.log("Account Balances:");
  console.log(`Sender (${env.senderAccountId}): https://hashscan.io/testnet/account/${env.senderAccountId}`);
  console.log(`Recipient (${env.recipientAccountId}): https://hashscan.io/testnet/account/${env.recipientAccountId}`);
  console.log(`Token: ${env.tokenId}`);
  console.log("\nVisit the links above to check token balances in the 'Tokens' tab");
}

checkBalances();