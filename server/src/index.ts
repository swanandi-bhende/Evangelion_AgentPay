import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { hederaService } from './services/hederaService';
import { getEnvVars, validateEnvironment } from "../utils/env";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AgentPay Backend is running',
    network: 'Hedera Testnet'
  });
});

// Test transfer endpoint
app.post('/test-transfer', async (req, res) => {
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
        message: 'Transfer completed successfully',
        transactionId: result.transactionId,
        hashScanUrl: `https://hashscan.io/testnet/transaction/${result.transactionId}`
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// ✅ New: Get token balances for sender and recipient
app.get('/balances', async (req, res) => {
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
          balance: senderBalance
        },
        recipient: {
          accountId: env.recipientAccountId,
          balance: recipientBalance
        }
      }
    });

  } catch (error) {
    console.error("Error in /balances:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`AgentPay Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Balance check: http://localhost:${PORT}/balances`);
});

// Validate environment on startup
try {
  validateEnvironment();
  console.log('Environment variables validated');
} catch (error) {
  console.error('Environment validation failed:', error);
  process.exit(1);
}
