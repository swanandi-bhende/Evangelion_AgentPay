# Evangelion AgentPay: AI-Powered Cross-Border Remittance Platform  

---

## Overview

This is an AI-powered cross-border remittance platform that combines the speed and efficiency of blockchain with the simplicity of natural language AI. Built on the Hedera network, it enables users to send international payments as easily as sending a text message.

---

## Key Features

- **AI-Powered Interface:** Send payments using natural language commands  
- **Instant Settlements:** Near-instant transactions on Hedera network  
- **Low Cost:** Minimal transaction fees compared to traditional remittance services  
- **Transparent:** Real-time transaction tracking with **HashScan** integration  

---

## Key Integrations

| Integration | Description |
|--------------|-------------|
| **PayPal USD (PYUSD)** | Stablecoin representation |
| **Hedera Testnet** | Blockchain infrastructure |
| **HashScan** | Transaction explorer |
| **Google Gemini AI** | Natural language processing |

---

## Prerequisites

Before running this project, ensure you have:

- **Node.js 18+** installed  
- **npm** or **yarn** package manager  
- **Hedera Testnet account**  
- **Google Gemini API key**

---

## Quick Start

### 1️. Clone the Repository

```bash
git clone <repository_url>
cd Evangelion_AgentPay
```

### 2️. Backend Setup
```bash
cd backend
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
Edit your .env file with your credentials:

.env
# Hedera Testnet Accounts
SENDER_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
SENDER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
RECIPIENT_ACCOUNT_ID=0.0.RECIPIENT_ACCOUNT_ID
RECIPIENT_PRIVATE_KEY=0xRECIPIENT_PRIVATE_KEY

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port
PORT=3001

# Token ID (generated during setup)
TOKEN_ID=

```

### 4. Initialize Hedera Environment
```bash
# Create test token (TPYUSD)
npm run setup-token

# Associate token with recipient account
npm run associate-token

# Verify setup
npm run check-association

```
### 5. Frontend Setup
```bash
cd ../frontend
npm install
```

### 6. Set up environment variables
```bash
cp .env.local.example .env.local
Edit .env.local:

.env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SENDER_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
```

### 7. Run the Application
Terminal 1 - Start Backend
```bash
cd backend
npm run dev
```
Terminal 2 - Start Frontend
```bash
cd frontend
npm run dev
```
Open http://localhost:3000 in your browser.

## How to Use
### Registration & Login
Create a new account or login with existing credentials
Provide your Hedera account ID during registration

### Sending Payments

**Method 1: AI Assistant (Recommended)**<br>
Use the chat interface in the dashboard:<br>
Examples:<br>
"Send 10 TPYUSD to 0.0.1234567"<br>
"Transfer 5 tokens to 0.0.1234567"<br>
"Please send 15 TPYUSD to account 0.0.1234567"<br>

**Method 2: Manual Transfer**<br>
Go to “Send Money” page<br>
Enter amount and recipient details<br>
Confirm transaction<br>

### Viewing Transactions
Navigate to the “Transactions” page
View real-time status and HashScan links
Monitor successful and failed transactions

## Development Scripts
### Backend

```bash
npm run dev              # Start development server
npm run setup-token      # Create test token on Hedera
npm run associate-token  # Associate token with accounts
npm run test-transfer    # Test token transfer functionality
npm run test-agent       # Test AI agent with sample messages
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
```

## Technology Stack

### Backend
Node.js with Express.js<br>
Hedera Hashgraph (Distributed Ledger Technology)<br>
Hedera Token Service (HTS) for stablecoin operations<br>
ECDSA wallet support<br>
TypeScript<br>
Google Gemini API for NLP<br>
Testnet environment<br>

### Frontend
Next.js 14 with React<br>
Tailwind CSS for styling<br>
TypeScript<br>

## Future Improvements
### User Experience
Support for multiple languages<br>
Better error handling and guidance<br>
Mobile-responsive design improvements<br>
Real-time balance updates<br>
Transaction templates for frequent recipients<br>

### Security & Compliance
Two-factor authentication (2FA)<br>
Enhanced KYC/AML integration<br>
Transaction limits and monitoring<br>

### Multi-Currency & Cross-Chain
Additional stablecoins (USDC, USDT)<br>
Currency conversion features<br>
Cross-chain compatibility<br>

### Enterprise Features
Bulk payments<br>
Regulatory compliance across jurisdictions<br>

## License
This project is licensed under the MIT License — see the LICENSE file for details.

## Demo Video
#### Watch the full demo here: https://youtu.be/VgBj8BA_Yro?si=LGoUttCG-TkNQ6u_
