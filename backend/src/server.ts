import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import HederaSetup from './services/hedera-setup';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`AgentPay Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});