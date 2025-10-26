import { simpleAgent } from "./agent/simpleAgent.js";

/**
 * Lightweight AgentService fallback
 *
 * NOTE: The original implementation used langchain + @langchain/google-genai
 * and attempted to construct a Gemini-backed agent. That code caused
 * TypeScript mismatches during production builds in Docker (incompatible
 * types across langchain & google-genai packages). To make CI/builds
 * and deployments stable, this implementation intentionally provides a
 * minimal wrapper around the existing `simpleAgent`.
 *
 * This preserves the public contract used by `src/index.ts`:
 * - processMessage(message: string): Promise<string>
 * - isReady(): boolean
 *
 * Future work: reintroduce a LangChain-based agent when compatible
 * package versions are chosen and the TypeScript signatures are aligned.
 */

export class AgentService {
  // No remote agent executor in this stable fallback
  constructor() {
    // Intentionally synchronous and lightweight
  }

  async processMessage(message: string): Promise<string> {
    // Delegate to simple rule-based agent
    return await simpleAgent.processMessage(message);
  }

  isReady(): boolean {
    // Always available (simple agent)
    return true;
  }
}

export const agentService = new AgentService();
