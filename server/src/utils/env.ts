import dotenv from "dotenv";

dotenv.config();

export function validateEnvironment(): void {
  const required = [
    'SENDER_ACCOUNT_ID',
    'SENDER_PRIVATE_KEY', 
    'RECIPIENT_ACCOUNT_ID',
    'TOKEN_ID'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export function getEnvVars() {
  validateEnvironment();
  
  return {
    senderAccountId: process.env.SENDER_ACCOUNT_ID!,
    senderPrivateKey: process.env.SENDER_PRIVATE_KEY!,
    recipientAccountId: process.env.RECIPIENT_ACCOUNT_ID!,
    tokenId: process.env.TOKEN_ID!
  };
}