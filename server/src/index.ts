import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { agentService } from "./agentService";
import { simpleAgent } from "./agent/simpleAgent";
import { hederaService } from "./hederaService";
import { getEnvVars, validateEnvironment } from "../utils/env";

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Production CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000", // Local dev
    process.env.FRONTEND_URL || "https://your-frontend.vercel.app", // Replace or use env var
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// 🩺 Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "AgentPay Backend is running",
    network: "Hedera Testnet",
    agentReady: agentService.isReady(),
  });
});

// 💬 Chat endpoint (AI + Simple agent fallback)
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message is required and must be a string",
      });
    }

    console.log("🗣️ Incoming user message:", message);

    let rawResponse: string;

    if (agentService.isReady()) {
      rawResponse = await agentService.processMessage(message);
    } else {
      console.log("⚙️ AI agent not ready — using simple agent");
      rawResponse = await simpleAgent.processMessage(message);
    }

    let cleanResponse = rawResponse;

    try {
      const parsed = JSON.parse(rawResponse);

      if (Array.isArray(parsed.messages)) {
        const aiMessage = [...parsed.messages]
          .reverse()
          .find(
            (msg) =>
              msg.type === "constructor" &&
              msg.id?.includes("AIMessage") &&
              typeof msg.kwargs?.content === "string"
          );

        if (aiMessage?.kwargs?.content) {
          cleanResponse = aiMessage.kwargs.content;
        }
      }
    } catch {
      // Not JSON — keep original
    }

    console.log("✅ Final AI response:", cleanResponse);

    res.json({
      success: true,
      response: cleanResponse,
      agentType: agentService.isReady() ? "ai" : "simple",
    });
  } catch (error) {
    console.error("❌ Chat processing error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// 🔁 Manual test endpoint for token transfer
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
    console.error("❌ Transfer test failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// 💰 Token balance check
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
    console.error("❌ Balance check failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// ✅ Validate env vars before start
try {
  validateEnvironment();
  console.log("✅ Environment variables validated successfully.");
} catch (error) {
  console.error("❌ Environment validation failed:", error);
  process.exit(1);
}

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 AgentPay Backend running on port ${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`💸 Test transfer endpoint: http://localhost:${PORT}/test-transfer`);
  console.log(`📊 Balances endpoint: http://localhost:${PORT}/balances`);
  console.log(`🤖 Agent status: ${agentService.isReady() ? "Ready" : "Initializing..."}`);
});
