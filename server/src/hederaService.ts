import {
  Client,
  PrivateKey,
  TransferTransaction,
  TransactionReceipt,
  Hbar,
  AccountId,
  TokenId,
  AccountBalanceQuery
} from "@hashgraph/sdk";
import { getEnvVars } from "../utils/env.js"; // <-- .js for ESM

export interface TransferResult {
  success: boolean;
  transactionId?: string;
  receipt?: TransactionReceipt;
  error?: string;
}

export class HederaService {
  async transferTokens(
    senderId: string,
    senderPrivateKey: string,
    receiverId: string,
    tokenId: string,
    amount: number
  ): Promise<TransferResult> {
    try {
      // Simulation mode for development: return a fake successful transaction when enabled
      if (process.env.SIMULATE_TRANSFERS === 'true') {
        const fakeId = `${senderId}@${Date.now()}`;
        console.log(`SIMULATED transfer: ${amount} ${tokenId} from ${senderId} to ${receiverId} -> tx ${fakeId}`);
        return {
          success: true,
          transactionId: fakeId
        };
      }

      let senderKeyObj;
      // Normalize key string and try multiple parsers to avoid INVALID_SIGNATURE
      let keyStr = String(senderPrivateKey || process.env.SENDER_PRIVATE_KEY || '');
      // strip 0x prefix if present
      if (keyStr.startsWith('0x') || keyStr.startsWith('0X')) keyStr = keyStr.slice(2);

      const tryParsers = [
        // try ECDSA hex (no 0x)
        async (k: string) => {
          try {
            // @ts-ignore
            return PrivateKey.fromStringECDSA ? PrivateKey.fromStringECDSA(k) : PrivateKey.fromString(k);
          } catch (e) {
            throw e;
          }
        },
        // try default fromString (handles ED25519 strings)
        async (k: string) => PrivateKey.fromString(k),
        // as last resort, try ED25519 specific method if available
        async (k: string) => {
          try {
            // @ts-ignore
            return PrivateKey.fromStringED25519 ? PrivateKey.fromStringED25519(k) : PrivateKey.fromString(k);
          } catch (e) {
            throw e;
          }
        }
      ];

      let lastErr: any = null;
      for (const p of tryParsers) {
        try {
          // eslint-disable-next-line no-await-in-loop
          // @ts-ignore
          senderKeyObj = await p(keyStr);
          if (senderKeyObj) break;
        } catch (err) {
          lastErr = err;
        }
      }
      if (!senderKeyObj) {
        console.error('All key parsers failed:', lastErr);
        throw new Error('Invalid sender private key format');
      }

      try {
        const pub = senderKeyObj.publicKey ? senderKeyObj.publicKey.toString() : (senderKeyObj.toString ? senderKeyObj.toString() : '');
        console.log('Parsed sender public key:', pub);
      } catch (e: any) {
        // ignore
      }

      const client = Client.forTestnet();
      // To avoid INVALID_SIGNATURE issues during testing, set the transaction operator to the sender
      // so the payer is the sender account and the sender's signature will be used for submission.
      client.setOperator(AccountId.fromString(senderId), senderKeyObj);

      // Debug: fetch on-chain account key for comparison
      try {
        // dynamic import to avoid circular typing issues
        // @ts-ignore
        const { AccountInfoQuery } = await import('@hashgraph/sdk');
        const info = await new AccountInfoQuery().setAccountId(senderId).execute(client);
        // @ts-ignore
        console.log('On-chain account key:', info.key?.toString());
      } catch (e: any) {
        console.warn('Could not fetch account info for debug:', e?.message || e);
      }

      console.log(`Initiating transfer of ${amount} tokens...`);
      console.log(`From: ${senderId} | To: ${receiverId} | Token: ${tokenId}`);

      // NOTE: token decimals are assumed to be 2 for TPYUSD; adjust if your token uses different decimals.
      const units = Math.round(amount * 100);

      const transaction = new TransferTransaction()
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(senderId), -units)
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(receiverId), units)
        .setMaxTransactionFee(new Hbar(1))
        .freezeWith(client);

      // Sign with the sender's key (and client will sign with operator key if one is configured)
      const signedTx = await transaction.sign(senderKeyObj);
      const response = await signedTx.execute(client);
      const receipt = await response.getReceipt(client);

      console.log("Transfer successful!");
      console.log("Transaction ID:", response.transactionId.toString());
      console.log("Status:", receipt.status.toString());

      return {
        success: receipt.status.toString() === "SUCCESS",
        transactionId: response.transactionId.toString(),
        receipt
      };

    } catch (error) {
      console.error("Transfer failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getTokenBalance(accountId: string, tokenId: string): Promise<number> {
    try {
      const client = Client.forTestnet();

      const balance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client);

      const tokenBalances = balance.tokens;
      const tokenIdObj = TokenId.fromString(tokenId);

      const tokenBalance = tokenBalances?.get(tokenIdObj);
      return tokenBalance ? tokenBalance.toNumber() / 100 : 0;

    } catch (error) {
      console.error("Balance check failed:", error);
      return 0;
    }
  }

  async getAccountPublicKey(accountId: string, privateKeyStr?: string): Promise<string> {
    try {
      const keyStr = privateKeyStr || process.env.SENDER_PRIVATE_KEY!;
      let keyObj;
      const hexMatch = typeof keyStr === 'string' && /^0x[0-9a-f]+$/i.test(keyStr);
      if (hexMatch) {
        // @ts-ignore
        keyObj = PrivateKey.fromStringECDSA(keyStr);
      } else {
        keyObj = PrivateKey.fromString(keyStr);
      }

      const client = Client.forTestnet();
      client.setOperator(AccountId.fromString(accountId), keyObj);

      const { AccountInfoQuery } = await import('@hashgraph/sdk');
      const info = await new AccountInfoQuery().setAccountId(accountId).execute(client);
      // @ts-ignore
      return info.key?.toString() || '';
    } catch (error: any) {
      console.error('Error fetching account public key:', error?.message || error);
      throw error;
    }
  }
}

export const hederaService = new HederaService();
