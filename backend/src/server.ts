import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import HederaSetup from './services/hedera-setup';
import HederaService from './services/hedera-service';
import AgentService from './services/agent-service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize agent service
const agentService = new AgentService();

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AgentPay MVP Backend Running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-hedera', async (req, res) => {
  try {
    const setup = new HederaSetup();
    const result = await setup.checkBalances();
    res.json({ 
      status: 'success', 
      message: 'Hedera connection successful',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Hedera connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/transfer', async (req, res) => {
  try {
    const { amount, recipient } = req.body;
    
    if (!amount || !recipient) {
      return res.status(400).json({
        status: 'error',
        message: 'Amount and recipient are required'
      });
    }

    const hederaService = new HederaService();
    
    const result = await hederaService.transferTokens(
      process.env.SENDER_ACCOUNT_ID!,
      process.env.SENDER_PRIVATE_KEY!,
      recipient,
      process.env.TOKEN_ID!,
      amount
    );

    res.json({
      status: 'success',
      message: 'Transfer completed successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Transfer failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// New endpoint for AI agent
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }

    const result = await agentService.processMessage(message);

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Agent processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`AgentPay Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});