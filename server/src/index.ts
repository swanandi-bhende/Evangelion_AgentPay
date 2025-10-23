import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { agentService } from "./agentService"; // no extension needed for ts files
import { simpleAgent } from "./agent/simpleAgent"; // assuming .js file, no change needed
import { hederaService } from "./hederaService"; // no extension needed for ts files
import { getEnvVars, validateEnvironment } from "../utils/env";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "AgentPay Backend is running",
    network: "Hedera Testnet",
    agentReady: agentService.isReady(),
  });
});

// Chat endpoint for AI agent
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message is required and must be a string",
      });
    }

    console.log(`Received message: ${message}`);

    let response: string;

    if (agentService.isReady()) {
      response = await agentService.processMessage(message);
    } else {
      console.log("AI agent not ready, using simple agent");
      response = await simpleAgent.processMessage(message);
    }

    res.json({
      success: true,
      response,
      agentType: agentService.isReady() ? "ai" : "simple",
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Test transfer endpoint
app.post("/test-transfer", async (req: Request, res: Response) => {
  try {
    const env = getEnvVars();
    const { amount = 1 } = req.body;

    const result = await hederaService.transferTokens(
      env.senderAccountId,
      env.senderPrivateKey,
      env.recipientAccountId,
      env.tokenId,
      amount
    );

    if (result.success) {
      res.json({
        success: true,
        message: "Transfer completed successfully",
        transactionId: result.transactionId,
        hashScanUrl: `https://hashscan.io/testnet/transaction/${result.transactionId}`,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("/test-transfer error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Get token balances for sender and recipient
app.get("/balances", async (req: Request, res: Response) => {
  try {
    const env = getEnvVars();

    const senderBalance = await hederaService.getTokenBalance(
      env.senderAccountId,
      env.tokenId
    );

    const recipientBalance = await hederaService.getTokenBalance(
      env.recipientAccountId,
      env.tokenId
    );

    res.json({
      success: true,
      tokenId: env.tokenId,
      balances: {
        sender: {
          accountId: env.senderAccountId,
          balance: senderBalance,
        },
        recipient: {
          accountId: env.recipientAccountId,
          balance: recipientBalance,
        },
      },
    });
  } catch (error) {
    console.error("/balances error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// Validate environment variables on startup
try {
  validateEnvironment();
  console.log("Environment variables validated");
} catch (error) {
  console.error("Environment validation failed:", error);
  process.exit(1);
}

// Start server
app.listen(PORT, () => {
  console.log(`AgentPay Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`Test transfer endpoint: http://localhost:${PORT}/test-transfer`);
  console.log(`Balances endpoint: http://localhost:${PORT}/balances`);
  console.log(`Agent status: ${agentService.isReady() ? "Ready" : "Initializing..."}`);
});
