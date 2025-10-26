import AgentService from '../services/agent-service';
import dotenv from 'dotenv';

dotenv.config();

async function testAgent() {
  try {
    const agentService = new AgentService();
    
    const testMessages = [
      "Send 10 TPYUSD to 0.0.2345678",
      "I want to transfer 5 TPYUSD to account 0.0.2345678",
      "How are you today?",
      "Please send 15 tokens to 0.0.2345678"
    ];

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