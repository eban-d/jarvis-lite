const { exec } = require('child_process');
const os = require('os');

class CommandEngine {
  constructor() {
    this.commands = this._buildCommandMap();
  }

  tryExecute(input) {
    const normalized = input.toLowerCase().trim();

    for (const [pattern, handler] of this.commands) {
      const match = normalized.match(pattern);
      if (match) {
        return handler(match, input);
      }
    }

    return null;
  }

  _buildCommandMap() {
    return new Map([
      // Time and date
      [/^(?:what(?:'s| is) the )?time\??$/i, () => ({
        type: 'system',
        response: `The current time is **${new Date().toLocaleTimeString()}**.`
      })],

      [/^(?:what(?:'s| is) (?:the |today(?:'s)? )?)?date\??$/i, () => ({
        type: 'system',
        response: `Today's date is **${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**.`
      })],

      [/^(?:what(?:'s| is) the )?day\??$/i, () => ({
        type: 'system',
        response: `Today is **${new Date().toLocaleDateString('en-US', { weekday: 'long' })}**.`
      })],

      // System info
      [/^(?:system ?info|sys ?info|my system)$/i, () => ({
        type: 'system',
        response: this._getSystemInfo()
      })],

      [/^(?:battery|battery ?status|power)$/i, () => ({
        type: 'system',
        response: '🔋 Battery status is available on supported devices. On desktop systems, you can check your system tray for battery information.'
      })],

      // Open websites
      [/^open\s+(https?:\/\/\S+)$/i, (match) => {
        this._openUrl(match[1]);
        return {
          type: 'action',
          response: `Opening **${match[1]}** in your browser...`
        };
      }],

      [/^(?:open|go to|launch|navigate to)\s+(?:the\s+)?(\w+(?:\.\w+)+)$/i, (match) => {
        const url = match[1].startsWith('http') ? match[1] : `https://${match[1]}`;
        this._openUrl(url);
        return {
          type: 'action',
          response: `Opening **${url}** in your browser...`
        };
      }],

      [/^(?:open|launch|go to)\s+(?:the\s+)?(youtube|google|github|stackoverflow|reddit|twitter|x|wikipedia|gmail|linkedin)$/i, (match) => {
        const sites = {
          youtube: 'https://www.youtube.com',
          google: 'https://www.google.com',
          github: 'https://github.com',
          stackoverflow: 'https://stackoverflow.com',
          reddit: 'https://www.reddit.com',
          twitter: 'https://twitter.com',
          x: 'https://twitter.com',
          wikipedia: 'https://www.wikipedia.org',
          gmail: 'https://mail.google.com',
          linkedin: 'https://www.linkedin.com'
        };
        const site = match[1].toLowerCase();
        const url = sites[site];
        this._openUrl(url);
        return {
          type: 'action',
          response: `Opening **${site.charAt(0).toUpperCase() + site.slice(1)}**...`
        };
      }],

      // Search
      [/^(?:search|google|look up|find)\s+(?:for\s+)?(.+)$/i, (match) => {
        const query = encodeURIComponent(match[1]);
        this._openUrl(`https://www.google.com/search?q=${query}`);
        return {
          type: 'action',
          response: `Searching for **"${match[1]}"**...`
        };
      }],

      // Greetings
      [/^(?:hi|hello|hey|good (?:morning|afternoon|evening)|howdy|sup|what'?s up)\b/i, () => ({
        type: 'greeting',
        response: this._getGreeting()
      })],

      // Identity
      [/^(?:who are you|what are you|what is your name|what'?s your name)\??$/i, () => ({
        type: 'info',
        response: 'I am **Jarvis Lite** — your personal AI assistant. I\'m powered by multiple AI systems to give you the best possible responses, completely free. How can I assist you today?'
      })],

      // Help
      [/^(?:help|commands|what can you do)\??$/i, () => ({
        type: 'info',
        response: this._getHelpText()
      })],

      // Clear
      [/^(?:clear|reset|new chat|start over)$/i, () => ({
        type: 'action',
        response: '🔄 Conversation cleared. Ready for a fresh start!'
      })],
    ]);
  }

  _getGreeting() {
    const hour = new Date().getHours();
    let timeGreeting;
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    const greetings = [
      `${timeGreeting}! I'm Jarvis Lite, your AI assistant. How can I help you today?`,
      `${timeGreeting}! Ready to assist you. What would you like to do?`,
      `${timeGreeting}! Jarvis Lite at your service. What's on your mind?`
    ];

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  _getSystemInfo() {
    const cpus = os.cpus();
    const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(1);
    const freeMem = (os.freemem() / (1024 ** 3)).toFixed(1);
    const uptime = this._formatUptime(os.uptime());

    return [
      '**System Information**',
      `- **OS:** ${os.type()} ${os.release()} (${os.arch()})`,
      `- **Hostname:** ${os.hostname()}`,
      `- **CPU:** ${cpus[0]?.model || 'Unknown'} (${cpus.length} cores)`,
      `- **Memory:** ${freeMem} GB free / ${totalMem} GB total`,
      `- **Uptime:** ${uptime}`,
      `- **Platform:** ${os.platform()}`
    ].join('\n');
  }

  _formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${mins}m`);
    return parts.join(' ');
  }

  _getHelpText() {
    return [
      '**Jarvis Lite — Available Commands**',
      '',
      '**System:**',
      '- `time` — Current time',
      '- `date` — Current date',
      '- `day` — Current day of the week',
      '- `system info` — System information',
      '',
      '**Navigation:**',
      '- `open youtube` — Open popular websites',
      '- `open example.com` — Open any website',
      '- `search [query]` — Google search',
      '',
      '**Chat:**',
      '- `clear` — Clear conversation',
      '- `help` — Show this help',
      '',
      '**AI Chat:**',
      '- Just type anything else to chat with AI!',
      '- I use smart routing to pick the best AI for your question.'
    ].join('\n');
  }

  _openUrl(url) {
    const platform = os.platform();
    let command;
    if (platform === 'win32') command = `start "" "${url}"`;
    else if (platform === 'darwin') command = `open "${url}"`;
    else command = `xdg-open "${url}"`;

    exec(command, (error) => {
      if (error) {
        console.error('Failed to open URL:', error.message);
      }
    });
  }
}

module.exports = { CommandEngine };
