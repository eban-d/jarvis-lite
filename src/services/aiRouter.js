const { GroqProvider } = require('./providers/groqProvider');
const { GeminiProvider } = require('./providers/geminiProvider');
const { OpenRouterProvider } = require('./providers/openRouterProvider');

class AIRouter {
  constructor(memoryManager) {
    this.memoryManager = memoryManager;
    this.providers = {
      groq: new GroqProvider(),
      gemini: new GeminiProvider(),
      openrouter: new OpenRouterProvider()
    };

    this.routingConfig = {
      coding: { primary: 'groq', model: 'llama-3.3-70b-versatile', fallbacks: ['gemini', 'openrouter'] },
      reasoning: { primary: 'gemini', model: 'gemini-2.0-flash', fallbacks: ['groq', 'openrouter'] },
      general: { primary: 'groq', model: 'llama-3.3-70b-versatile', fallbacks: ['gemini', 'openrouter'] },
      creative: { primary: 'gemini', model: 'gemini-2.0-flash', fallbacks: ['groq', 'openrouter'] }
    };

    this.providerStatus = {
      groq: { available: true, errors: 0, lastError: null },
      gemini: { available: true, errors: 0, lastError: null },
      openrouter: { available: true, errors: 0, lastError: null }
    };
  }

  async route(message, conversationHistory) {
    const category = this._categorize(message);
    const config = this.routingConfig[category];

    const providerOrder = [config.primary, ...config.fallbacks];

    for (const providerName of providerOrder) {
      const provider = this.providers[providerName];
      const status = this.providerStatus[providerName];

      if (!status.available || !provider.isConfigured()) {
        continue;
      }

      try {
        const response = await provider.chat(message, conversationHistory, config.model);
        status.errors = 0;
        return {
          response: response,
          provider: providerName,
          model: config.model,
          category: category
        };
      } catch (error) {
        console.error(`Provider ${providerName} failed:`, error.message);
        status.errors++;
        status.lastError = error.message;

        if (status.errors >= 3) {
          status.available = false;
          setTimeout(() => {
            status.available = true;
            status.errors = 0;
          }, 60000);
        }
      }
    }

    return {
      response: 'I apologize, but all AI providers are currently unavailable. Please check your API keys in Settings, or try again in a moment.',
      provider: 'none',
      model: 'none',
      category: category
    };
  }

  _categorize(message) {
    const lower = message.toLowerCase();

    const codingPatterns = [
      /\b(code|program|function|class|bug|debug|error|compile|syntax|algorithm|api|html|css|javascript|python|java|c\+\+|sql|database|git|deploy|webpack|npm|node|react|angular|vue)\b/,
      /\b(write|create|build|implement|fix|refactor)\s+(a\s+)?(code|program|script|function|app|application|website|page)\b/,
      /```/
    ];

    const reasoningPatterns = [
      /\b(why|how does|explain|analyze|compare|difference|pros and cons|advantage|disadvantage|theory|concept|principle|philosophy)\b/,
      /\b(think|reason|logic|deduce|infer|calculate|math|equation|formula|prove|solve)\b/,
      /\b(what (?:is|are) the (?:reason|cause|effect|impact|implication))\b/
    ];

    const creativePatterns = [
      /\b(write|create|compose|draft)\s+(a\s+)?(story|poem|essay|article|blog|song|lyric|letter|email|speech)\b/,
      /\b(creative|imagine|fiction|narrative|brainstorm|idea)\b/
    ];

    if (codingPatterns.some(p => p.test(lower))) return 'coding';
    if (reasoningPatterns.some(p => p.test(lower))) return 'reasoning';
    if (creativePatterns.some(p => p.test(lower))) return 'creative';
    return 'general';
  }

  getStatus() {
    const status = {};
    for (const [name, provider] of Object.entries(this.providers)) {
      status[name] = {
        configured: provider.isConfigured(),
        available: this.providerStatus[name].available,
        errors: this.providerStatus[name].errors,
        lastError: this.providerStatus[name].lastError
      };
    }
    return status;
  }

  getSettings() {
    return {
      routing: this.routingConfig,
      providers: this.getStatus()
    };
  }

  updateSettings(settings) {
    if (settings.apiKeys) {
      if (settings.apiKeys.groq !== undefined) {
        this.providers.groq.setApiKey(settings.apiKeys.groq);
      }
      if (settings.apiKeys.gemini !== undefined) {
        this.providers.gemini.setApiKey(settings.apiKeys.gemini);
      }
      if (settings.apiKeys.openrouter !== undefined) {
        this.providers.openrouter.setApiKey(settings.apiKeys.openrouter);
      }
    }
  }
}

module.exports = { AIRouter };
