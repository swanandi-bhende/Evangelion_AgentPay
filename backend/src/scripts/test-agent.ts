import AgentService from '../services/agent-service';
import dotenv from 'dotenv';

dotenv.config();

async function testAgent() {
  try {
    const agentService = new AgentService();
    
    // Use the actual recipient account from environment that we know is associated
    const recipientAccount = process.env.RECIPIENT_ACCOUNT_ID || '0.0.7103251';
    
    const testMessages = [
      `Send 10 TPYUSD to ${recipientAccount}`,
      `I want to transfer 5 TPYUSD to account ${recipientAccount}`,
      "How are you today?",
      `Please send 15 tokens to ${recipientAccount}`
    ];

    console.log(`Testing with recipient account: ${recipientAccount}`);

    for (const message of testMessages) {
      console.log(`\n--- Testing: "${message}" ---`);
      const result = await agentService.processMessage(message);
      console.log('Response:', result.response);
      if (result.transactionId) {
        console.log('Transaction ID:', result.transactionId);
      }
    }
  } catch (error) {
    console.error('Agent test failed:', error);
  }
}

if (require.main === module) {
  testAgent()
    .then(() => console.log('Agent test completed'))
    .catch(console.error);
}

export default testAgent;