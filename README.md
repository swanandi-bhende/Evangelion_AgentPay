# ETHOnline_25_Evangelion_AgentPay
AgentPay - AI-Powered Cross-Border Remittance Platform

# Overview

AgentPay is a cross-border payment platform that combines the speed and efficiency of blockchain technology with the simplicity of natural language AI. Built on the Hedera network, AgentPay allows users to send international payments as easily as sending a text message.

# Key Features

AI-Powered Interface: Send payments using natural language commands

Instant Settlements: Near-instant transactions on Hedera network

Low Cost: Minimal transaction fees compared to traditional remittance services

Transparent: Real-time transaction tracking with HashScan integration

# Key Integrations

PayPal USD (PYUSD) - Stablecoin representation

Hedera Testnet - Blockchain infrastructure

HashScan - Transaction explorer

Google Gemini AI - Natural language processing

# Prerequisites

Before running this project, ensure you have:

Node.js 18+ installed

npm or yarn package manager

Hedera Testnet account 

Google Gemini API key

# Quick Start

Clone the Repository
   
bash

git clone <your-repo-url>

cd Evangelion_AgentPay

Backend Setup
   
bash

cd backend

**Install dependencies**

npm install

**Set up environment variables**

cp .env.example .env

Edit the .env file with your credentials:

env

**Hedera Testnet Accounts**

SENDER_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID

SENDER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

RECIPIENT_ACCOUNT_ID=0.0.RECIPIENT_ACCOUNT_ID

RECIPIENT_PRIVATE_KEY=0xRECIPIENT_PRIVATE_KEY

**Gemini API Key**

GEMINI_API_KEY=your_gemini_api_key_here

**Server Port**

PORT=3001

**Token ID (will be generated during setup)**

TOKEN_ID=

Initialize Hedera Environment
   
bash

**Create test token (TPYUSD)**

npm run setup-token

**Associate token with recipient account**

npm run associate-token

**Verify setup**

npm run check-association

Frontend Setup

bash

cd ../frontend

**Install dependencies**

npm install

**Set up environment variables**

cp .env.local.example .env.local

Edit the .env.local file:

env

NEXT_PUBLIC_API_URL=http://localhost:3001

NEXT_PUBLIC_SENDER_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID

Run the Application

bash

**Terminal 1 - Start backend**

cd backend

npm run dev

**Terminal 2 - Start frontend**

cd frontend

npm run dev

Access the Application
 
Open http://localhost:3000 in your browser.

# How to Use

1. Registration & Login
   
2. Create a new account or login with existing credentials
   
3. Provide your Hedera account ID during registration

4. Sending Payments
5. 
Method 1: AI Assistant (Recommended)

Use the chat interface in the dashboard

Type natural language commands like:

"Send 10 TPYUSD to 0.0.1234567"

"Transfer 5 tokens to 0.0.1234567"

"Please send 15 TPYUSD to account 0.0.1234567"

Method 2: Manual Transfer

Navigate to "Send Money" page

Fill in amount and recipient details

Confirm transaction

6. Viewing Transactions

Check "Transactions" page for complete history

View real-time status and HashScan links

Monitor successful and failed transactions

# Development Scripts

Backend Scripts

bash

npm run dev          # Start development server

npm run setup-token  # Create test token on Hedera

npm run associate-token # Associate token with accounts

npm run test-transfer # Test token transfer functionality

npm run test-agent   # Test AI agent with sample messages

Frontend Scripts

bash

npm run dev          # Start development server

npm run build        # Build for production

npm run start        # Start production server

# Technology Stack

**Backend**

Node.js with Express.js

Hedera Hashgraph - Distributed Ledger Technology

Hedera Token Service (HTS) for stablecoin operations

ECDSA wallet support

Testnet environment

AI Integration - Google Gemini API for natural language processing

TypeScript for type safety

**Frontend**

Next.js 14 with React

Tailwind CSS for styling

TypeScript for type safety

Lucide React for icons

Context API for state management

# Future Improvements

Support for multiple languages

Better error handling and user guidance

Mobile-responsive design improvements

Real-time balance updates

Transaction templates for frequent recipients

Two-factor authentication

Enhanced KYC/AML integration

Transaction limits and monitoring

Multi-Currency Support

Additional stablecoins (USDC, USDT)

Currency conversion features

Cross-chain compatibility

Enterprise Features

Bulk payments

Regulatory compliance across jurisdictions

# License

This project is licensed under the MIT License - see the LICENSE file for details.

