import {
  Client,
  PrivateKey,
  AccountId,
  TokenId,
  AccountBalanceQuery
} from "@hashgraph/sdk";
import dotenv from 'dotenv';

dotenv.config();

async function checkTokenAssociation() {
  try {
    console.log('Checking token association status...');

    const senderAccountId = AccountId.fromString(process.env.SENDER_ACCOUNT_ID!);
    const senderPrivateKey = PrivateKey.fromStringECDSA(process.env.SENDER_PRIVATE_KEY!);
    const recipientAccountId = AccountId.fromString(process.env.RECIPIENT_ACCOUNT_ID!);
    const tokenId = TokenId.fromString(process.env.TOKEN_ID!);

    // Initialize client
    const client = Client.forTestnet();
    client.setOperator(senderAccountId, senderPrivateKey);

    console.log(`Checking association for account: ${recipientAccountId.toString()}`);
    console.log(`With token: ${tokenId.toString()}`);

    // Check sender's token balance
    const senderBalance = await new AccountBalanceQuery()
      .setAccountId(senderAccountId)
      .execute(client);

    console.log('\nSender Account Info:');
    console.log(`HBAR Balance: ${senderBalance.hbars.toString()}`);
    console.log('Tokens:', senderBalance.tokens?.toString() || 'No tokens');

    // Check recipient's token balance
    const recipientBalance = await new AccountBalanceQuery()
      .setAccountId(recipientAccountId)
      .execute(client);

    console.log('\nRecipient Account Info:');
    console.log(`HBAR Balance: ${recipientBalance.hbars.toString()}`);
    console.log('Tokens:', recipientBalance.tokens?.toString() || 'No tokens');

    // Check specific token association
    const senderTokenBalance = senderBalance.tokens?.get(tokenId);
    const recipientTokenBalance = recipientBalance.tokens?.get(tokenId);

    console.log('\nToken Association Status:');
    console.log(`Sender has token ${tokenId.toString()}: ${senderTokenBalance !== undefined ? 'YES' : 'NO'}`);
    console.log(`Recipient has token ${tokenId.toString()}: ${recipientTokenBalance !== undefined ? 'YES' : 'NO'}`);

    if (recipientTokenBalance !== undefined) {
      console.log(`Token is already associated with recipient account`);
      console.log(`Recipient token balance: ${(recipientTokenBalance?.toNumber() || 0) / 100} TPYUSD`);
    } else {
      console.log(`Token is NOT associated with recipient account`);
      console.log('Run "npm run associate-token" to fix this');
    }

    return {
      senderAssociated: senderTokenBalance !== undefined,
      recipientAssociated: recipientTokenBalance !== undefined,
      senderBalance: senderTokenBalance ? senderTokenBalance.toNumber() / 100 : 0,
      recipientBalance: recipientTokenBalance ? recipientTokenBalance.toNumber() / 100 : 0
    };
  } catch (error) {
    console.error('Error checking token association:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkTokenAssociation()
    .then((result) => {
      console.log('\nAssociation check completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Association check failed:', error);
      process.exit(1);
    });
}

export default checkTokenAssociation;
