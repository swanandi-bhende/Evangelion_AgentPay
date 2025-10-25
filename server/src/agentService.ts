import { IntelligentAgent } from "./agent/intelligentAgent.js";
import { simpleAgent } from "./agent/simpleAgent.js";

/**
 * AgentService with intelligent Gemini-powered processing
 * 
 * This service uses the Gemini-powered intelligent agent for natural
 * language understanding and cross-border payment processing. It falls
 * back to the simple agent if there are any issues with the AI service.
 */
export class AgentService {
  private useIntelligentAgent: boolean = true;
  private intelligentAgentInstance: IntelligentAgent | null = null;

  constructor() {
    // Check if we have the required API key
    if (!process.env.GOOGLE_API_KEY) {
      console.warn('⚠️ No GOOGLE_API_KEY found, falling back to simple agent');
      this.useIntelligentAgent = false;
    }
    // Lazily instantiate intelligent agent if available
    if (this.useIntelligentAgent) {
      try {
        this.intelligentAgentInstance = new IntelligentAgent();
      } catch (err) {
        console.error('Failed to initialize IntelligentAgent, falling back to simple agent:', err);
        this.useIntelligentAgent = false;
        this.intelligentAgentInstance = null;
      }
    }
  }

  async processMessage(message: string): Promise<string> {
    try {
      if (this.useIntelligentAgent && this.intelligentAgentInstance) {
        return await this.intelligentAgentInstance.processMessage(message);
      } else {
        return await simpleAgent.processMessage(message);
      }
    } catch (error) {
      console.error('Error in intelligent agent, falling back to simple agent:', error);
      return await simpleAgent.processMessage(message);
    }
  }

  isReady(): boolean {
    // If we're configured to use the intelligent agent, report readiness
    // based on whether it was successfully instantiated. Otherwise the
    // simple agent is always ready.
    if (this.useIntelligentAgent) {
      return this.intelligentAgentInstance !== null;
    }
    return true;
  }

  getActiveAgentName(): string {
    if (this.useIntelligentAgent && this.intelligentAgentInstance) return 'intelligent';
    return 'simple';
  }
}

export const agentService = new AgentService();
