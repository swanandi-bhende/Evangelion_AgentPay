import { intelligentAgent } from "./agent/intelligentAgent.js";
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

  constructor() {
    // Check if we have the required API key
    if (!process.env.GOOGLE_API_KEY) {
      console.warn('⚠️ No GOOGLE_API_KEY found, falling back to simple agent');
      this.useIntelligentAgent = false;
    }
  }

  async processMessage(message: string): Promise<string> {
    try {
      if (this.useIntelligentAgent) {
        return await intelligentAgent.processMessage(message);
      } else {
        return await simpleAgent.processMessage(message);
      }
    } catch (error) {
      console.error('Error in intelligent agent, falling back to simple agent:', error);
      return await simpleAgent.processMessage(message);
    }
  }

  isReady(): boolean {
    return true; // We always have at least the simple agent available
  }
}

export const agentService = new AgentService();
