import {
  Client,
  PrivateKey,
  AccountId,
  TokenId,
  TokenAssociateTransaction,
  TransactionReceipt
} from "@hashgraph/sdk";
import dotenv from 'dotenv';

dotenv.config();

async function associateTokenWithRecipient() {
  try {
    console.log('Starting token association process...');
    
    // Check if required environment variables are set
    if (!process.env.SENDER_ACCOUNT_ID || !process.env.SENDER_PRIVATE_KEY) {
      throw new Error('Sender account ID and private key must be set in environment variables');
    }
    
    if (!process.env.RECIPIENT_ACCOUNT_ID || !process.env.RECIPIENT_PRIVATE_KEY) {
      throw new Error('Recipient account ID and private key must be set in environment variables');
    }
    
    if (!process.env.TOKEN_ID) {
      throw new Error('Token ID must be set in environment variables');
    }

    console.log('Environment variables loaded successfully');
    console.log(`Sender Account: ${process.env.SENDER_ACCOUNT_ID}`);
    console.log(`Recipient Account: ${process.env.RECIPIENT_ACCOUNT_ID}`);
    console.log(`Token ID: ${process.env.TOKEN_ID}`);

    const senderAccountId = AccountId.fromString(process.env.SENDER_ACCOUNT_ID);
    const senderPrivateKey = PrivateKey.fromStringECDSA(process.env.SENDER_PRIVATE_KEY);
    const recipientAccountId = AccountId.fromString(process.env.RECIPIENT_ACCOUNT_ID);
    const recipientPrivateKey = PrivateKey.fromStringECDSA(process.env.RECIPIENT_PRIVATE_KEY);
    const tokenId = TokenId.fromString(process.env.TOKEN_ID);

    // Initialize client with sender as operator
    const client = Client.forTestnet();
    client.setOperator(senderAccountId, senderPrivateKey);

    console.log('Creating token association transaction...');

    // Create token association transaction for recipient
    const associateTx = new TokenAssociateTransaction()
      .setAccountId(recipientAccountId)
      .setTokenIds([tokenId])
      .setMaxTransactionFee(100) // Set appropriate fee
      .freezeWith(client);

    console.log('Transaction frozen, signing with recipient key...');

    // Sign with recipient's key (required for association)
    const associateSign = await associateTx.sign(recipientPrivateKey);
    const associateSubmit = await associateSign.execute(client);
    
    console.log('Transaction submitted, waiting for receipt...');
    
    const associateRx: TransactionReceipt = await associateSubmit.getReceipt(client);

    console.log(`Token association status: ${associateRx.status}`);
    console.log(`Token ${tokenId.toString()} is now associated with account ${recipientAccountId.toString()}`);

    return {
      status: associateRx.status.toString(),
      tokenId: tokenId.toString(),
      accountId: recipientAccountId.toString()
    };
  } catch (error) {
    console.error('Error associating token:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      
      // Check if it's an association error we can handle
      if (error.message.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
        console.log('Token is already associated with the account');
        return {
          status: 'ALREADY_ASSOCIATED',
          tokenId: process.env.TOKEN_ID,
          accountId: process.env.RECIPIENT_ACCOUNT_ID
        };
      }
    }
    
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  associateTokenWithRecipient()
    .then((result) => {
      console.log('\nToken association completed successfully!');
      console.log(`Result:`, result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nToken association failed!');
      process.exit(1);
    });
}

export default associateTokenWithRecipient;