import HederaSetup from "../services/hedera-setup";

async function main() {
  const setup = new HederaSetup();
  const result = await setup.setupTestEnvironment();
  
  console.log("\nToken Creation Complete!");
  console.log("Please add this to your .env file:");
  console.log(`TOKEN_ID=${result.tokenId}`);
  
  return result;
}

main().catch(console.error);