const https = require('https');

class OpenRouterProvider {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.baseUrl = 'openrouter.ai';
    this.defaultModel = 'meta-llama/llama-3.3-70b-instruct:free';
  }

  isConfigured() {
    return this.apiKey.length > 0;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  async chat(message, conversationHistory = []) {
    const messages = this._buildMessages(message, conversationHistory);

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        model: this.defaultModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048
      });

      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://jarvis-lite.app',
          'X-Title': 'Jarvis Lite',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              reject(new Error(`OpenRouter API error: ${parsed.error.message}`));
              return;
            }
            const content = parsed.choices?.[0]?.message?.content;
            if (!content) {
              reject(new Error('No response content from OpenRouter'));
              return;
            }
            resolve(content);
          } catch (e) {
            reject(new Error(`Failed to parse OpenRouter response: ${e.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`OpenRouter request failed: ${error.message}`));
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('OpenRouter request timed out'));
      });

      req.write(payload);
      req.end();
    });
  }

  _buildMessages(message, conversationHistory) {
    const systemMessage = {
      role: 'system',
      content: 'You are Jarvis Lite, an intelligent AI assistant. You are helpful, knowledgeable, and concise. You provide clear and accurate responses. When asked about code, you provide well-formatted code examples. You have a professional yet friendly personality.'
    };

    const messages = [systemMessage];

    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }

    messages.push({ role: 'user', content: message });

    return messages;
  }
}

module.exports = { OpenRouterProvider };
