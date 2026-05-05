/* ============================================
   JARVIS LITE — Chat Controller
   Handles chat messaging and UI
   ============================================ */

// eslint-disable-next-line no-unused-vars
class ChatController {
  constructor() {
    this.messageInput = document.getElementById('message-input');
    this.sendBtn = document.getElementById('send-btn');
    this.chatMessages = document.getElementById('chat-messages');
    this.welcomeMessage = document.getElementById('welcome-message');
    this.providerBadge = document.getElementById('provider-badge');
    this.clearBtn = document.getElementById('clear-btn');
    this.hasMessages = false;

    this._initEventListeners();
    this._loadHistory();
  }

  _initEventListeners() {
    // Send on button click
    this.sendBtn.addEventListener('click', () => this._handleSend());

    // Send on Enter (Shift+Enter for new line)
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._handleSend();
      }
    });

    // Auto-resize textarea
    this.messageInput.addEventListener('input', () => {
      this.messageInput.style.height = 'auto';
      this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 150) + 'px';
    });

    // Quick action buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.messageInput.value = btn.dataset.prompt;
        this._handleSend();
      });
    });

    // Clear chat
    this.clearBtn.addEventListener('click', () => this._handleClear());
  }

  async _handleSend() {
    const message = this.messageInput.value.trim();
    if (!message || app.isProcessing) return;

    // Hide welcome
    if (!this.hasMessages) {
      this.hasMessages = true;
      if (this.welcomeMessage) {
        this.welcomeMessage.style.display = 'none';
      }
    }

    // Add user message
    this._addMessage('user', message);
    this.messageInput.value = '';
    this.messageInput.style.height = 'auto';

    // Show thinking
    app.setProcessing(true);
    const thinkingEl = this._addThinkingIndicator();

    try {
      const result = await window.jarvis.sendMessage(message);

      // Remove thinking indicator
      if (thinkingEl && thinkingEl.parentNode) {
        thinkingEl.parentNode.removeChild(thinkingEl);
      }

      if (result.success) {
        this._addMessage('assistant', result.response, result.provider, result.model);

        // Update provider badge
        if (result.provider && result.provider !== 'none') {
          this.providerBadge.textContent = `${result.provider}${result.model ? ' • ' + result.model : ''}`;
          this.providerBadge.classList.add('active');
        }

        // Handle clear command
        if (result.type === 'command' && result.commandType === 'action' && message.toLowerCase().match(/^(clear|reset|new chat|start over)$/)) {
          await this._handleClear();
        }
      } else {
        this._addMessage('assistant', result.response || 'An error occurred. Please try again.');
      }
    } catch (error) {
      if (thinkingEl && thinkingEl.parentNode) {
        thinkingEl.parentNode.removeChild(thinkingEl);
      }
      this._addMessage('assistant', 'An unexpected error occurred. Please try again.');
      console.error('Chat error:', error);
    }

    app.setProcessing(false);
  }

  _addMessage(role, content, provider, model) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = role === 'user' ? 'U' : 'J';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (role === 'assistant') {
      // eslint-disable-next-line no-undef
      contentDiv.innerHTML = markdownRenderer.render(content);
    } else {
      contentDiv.textContent = content;
    }

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    // Add meta info for assistant messages
    if (role === 'assistant' && provider && provider !== 'none') {
      const metaDiv = document.createElement('div');
      metaDiv.className = 'message-meta';

      const providerSpan = document.createElement('span');
      providerSpan.className = 'message-provider';
      providerSpan.textContent = provider + (model ? ` • ${model}` : '');
      metaDiv.appendChild(providerSpan);

      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.gap = '4px';
      wrapper.appendChild(contentDiv);
      wrapper.appendChild(metaDiv);

      messageDiv.innerHTML = '';
      messageDiv.appendChild(avatarDiv);
      messageDiv.appendChild(wrapper);
    }

    this.chatMessages.appendChild(messageDiv);
    this._scrollToBottom();
  }

  _addThinkingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant thinking';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = 'J';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span></div>';

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    this.chatMessages.appendChild(messageDiv);
    this._scrollToBottom();

    return messageDiv;
  }

  async _handleClear() {
    await window.jarvis.clearConversation();
    this.chatMessages.innerHTML = '';
    this.hasMessages = false;
    this.providerBadge.textContent = 'AI Ready';
    this.providerBadge.classList.remove('active');

    // Re-add welcome
    const welcome = document.createElement('div');
    welcome.className = 'welcome-message';
    welcome.id = 'welcome-message';
    welcome.innerHTML = `
      <h1 class="welcome-title">JARVIS LITE</h1>
      <p class="welcome-subtitle">Your Personal AI, Powered by Intelligence, Not Money.</p>
      <div class="quick-actions">
        <button class="quick-btn" data-prompt="What can you do?">What can you do?</button>
        <button class="quick-btn" data-prompt="Tell me a fun fact">Fun Fact</button>
        <button class="quick-btn" data-prompt="Help me write code">Write Code</button>
        <button class="quick-btn" data-prompt="system info">System Info</button>
      </div>
    `;
    this.chatMessages.appendChild(welcome);
    this.welcomeMessage = welcome;

    // Re-bind quick action events
    welcome.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.messageInput.value = btn.dataset.prompt;
        this._handleSend();
      });
    });
  }

  async _loadHistory() {
    try {
      const history = await window.jarvis.getHistory();
      if (history && history.length > 0) {
        this.hasMessages = true;
        if (this.welcomeMessage) {
          this.welcomeMessage.style.display = 'none';
        }
        for (const msg of history) {
          this._addMessage(msg.role, msg.content);
        }
      }
    } catch {
      // History load failed silently
    }
  }

  _scrollToBottom() {
    requestAnimationFrame(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    });
  }
}

// Initialize chat
const chatController = new ChatController();
