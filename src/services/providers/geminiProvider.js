const https = require('https');

class GeminiProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.baseUrl = 'generativelanguage.googleapis.com';
    this.defaultModel = 'gemini-2.0-flash';
  }

  isConfigured() {
    return this.apiKey.length > 0;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  async chat(message, conversationHistory = []) {
    const contents = this._buildContents(message, conversationHistory);

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        },
        systemInstruction: {
          parts: [{
            text: 'You are Jarvis Lite, an intelligent AI assistant. You are helpful, knowledgeable, and concise. You provide clear and accurate responses. When asked about code, you provide well-formatted code examples. You have a professional yet friendly personality.'
          }]
        }
      });

      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: `/v1beta/models/${this.defaultModel}:generateContent?key=${this.apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
              reject(new Error(`Gemini API error: ${parsed.error.message}`));
              return;
            }
            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) {
              reject(new Error('No response content from Gemini'));
              return;
            }
            resolve(content);
          } catch (e) {
            reject(new Error(`Failed to parse Gemini response: ${e.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Gemini request failed: ${error.message}`));
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Gemini request timed out'));
      });

      req.write(payload);
      req.end();
    });
  }

  _buildContents(message, conversationHistory) {
    const contents = [];

    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    return contents;
  }
}

module.exports = { GeminiProvider };
