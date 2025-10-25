import {
  AccountId,
  Client,
  TokenId,
  TokenInfoQuery,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

export interface ComplianceCheck {
  type: "KYC" | "SANCTIONS" | "AML";
  status: "PASSED" | "FAILED" | "PENDING";
  timestamp: number;
  details?: string;
}

export interface ComplianceRecord {
  transactionId?: string;
  sender: string;
  recipient: string;
  amount: number;
  currency: string;
  checks: ComplianceCheck[];
  overallStatus: "APPROVED" | "REJECTED" | "PENDING";
}

/**
 * ComplianceService handles regulatory compliance:
 * - KYC verification
 * - Sanctions screening
 * - AML transaction checks
 * - Logging to Hedera (mocked for MVP)
 */
export class ComplianceService {
  private static instance: ComplianceService;
  private client: Client;
  private hcsTopicId: string;

  private constructor() {
    this.client = Client.forTestnet();

    if (process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_KEY) {
      this.client.setOperator(
        AccountId.fromString(process.env.HEDERA_OPERATOR_ID),
        process.env.HEDERA_OPERATOR_KEY
      );
    }

    this.hcsTopicId = process.env.HEDERA_COMPLIANCE_TOPIC_ID || "";
  }

  static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  /**
   * ✅ Simulated KYC check using token info (Hedera SDK compatible)
   */
  async checkKycStatus(accountId: string, tokenId: string): Promise<boolean> {
    try {
      const token = TokenId.fromString(tokenId);

      // Get general token info (we can’t query per-account KYC in SDK directly)
      const tokenInfo = await new TokenInfoQuery()
        .setTokenId(token)
        .execute(this.client);

      // For MVP: assume KYC is required and granted if token has a KYC key
      const hasKycKey = !!tokenInfo.kycKey;
      console.log(
        `🔍 Token ${tokenId} KYC key present: ${hasKycKey ? "Yes" : "No"}`
      );

      // Simulate: if token has KYC key, assume passed; otherwise fail
      return hasKycKey;
    } catch (error) {
      console.error("❌ Error checking KYC status:", error);
      return false;
    }
  }

  /**
   * ✅ Mock sanctions screening
   */
  async performSanctionsScreening(accountId: string): Promise<ComplianceCheck> {
    const isSanctioned = false;

    return {
      type: "SANCTIONS",
      status: isSanctioned ? "FAILED" : "PASSED",
      timestamp: Date.now(),
      details: isSanctioned
        ? `Account ${accountId} found on sanctions list`
        : "No sanctions detected",
    };
  }

  /**
   * ✅ Simple AML check
   */
  async performAmlCheck(
    sender: string,
    recipient: string,
    amount: number
  ): Promise<ComplianceCheck> {
    const isHighRisk = amount > 10000;

    return {
      type: "AML",
      status: isHighRisk ? "PENDING" : "PASSED",
      timestamp: Date.now(),
      details: isHighRisk
        ? "High-value transaction pending manual review"
        : "Transaction within safe limits",
    };
  }

  /**
   * ✅ Log compliance record to console (mock HCS)
   */
  async logToHcs(record: ComplianceRecord): Promise<string> {
    try {
      console.log("📝 Compliance Record:", JSON.stringify(record, null, 2));
      return "mock-hcs-sequence-no";
    } catch (error) {
      console.error("❌ Error logging to HCS:", error);
      throw error;
    }
  }

  /**
   * ✅ Run all compliance checks together
   */
  async validateTransaction(
    sender: string,
    recipient: string,
    amount: number,
    currency: string,
    tokenId: string
  ): Promise<ComplianceRecord> {
    const checks: ComplianceCheck[] = [];

    // KYC checks
    const senderKyc = await this.checkKycStatus(sender, tokenId);
    const recipientKyc = await this.checkKycStatus(recipient, tokenId);
    checks.push({
      type: "KYC",
      status: senderKyc && recipientKyc ? "PASSED" : "FAILED",
      timestamp: Date.now(),
      details: `Sender KYC: ${senderKyc}, Recipient KYC: ${recipientKyc}`,
    });

    // Sanctions
    const senderSanctions = await this.performSanctionsScreening(sender);
    const recipientSanctions = await this.performSanctionsScreening(recipient);
    checks.push(senderSanctions, recipientSanctions);

    // AML
    const amlCheck = await this.performAmlCheck(sender, recipient, amount);
    checks.push(amlCheck);

    // Compute overall status
    const hasFailed = checks.some((c) => c.status === "FAILED");
    const hasPending = checks.some((c) => c.status === "PENDING");

    const record: ComplianceRecord = {
      sender,
      recipient,
      amount,
      currency,
      checks,
      overallStatus: hasFailed
        ? "REJECTED"
        : hasPending
        ? "PENDING"
        : "APPROVED",
    };

    await this.logToHcs(record);
    return record;
  }
}

export const complianceService = ComplianceService.getInstance();
