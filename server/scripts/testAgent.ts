import { agentService } from "../src/agentService.js"; // <-- added .js for ESM

async function testAgent() {
  console.log("Testing AI Agent...");

  const testMessages = [
    "Send 5 TPYUSD to 0.0.1234567",
    "Help",
    "What can you do?",
    "Send 10 TPYUSD to invalid-account",
  ];

  for (const message of testMessages) {
    console.log(`\nUser: ${message}`);

    try {
      const response = await agentService.processMessage(message);
      console.log(`Agent: ${response}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error processing message "${message}": ${error.message}`);
      } else {
        console.error(`Unknown error processing message "${message}":`, error);
      }
    }

    // Wait 2 seconds between messages to avoid rate limits or flooding logs
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

// Delay start by 3 seconds to allow agentService to initialize if needed
setTimeout(() => {
  testAgent()
    .then(() => {
      console.log("Test completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("TestAgent encountered an error:", error);
      process.exit(1);
    });
}, 3000);
