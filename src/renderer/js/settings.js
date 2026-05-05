/* ============================================
   JARVIS LITE — Settings Controller
   Handles settings UI and API key management
   ============================================ */

// eslint-disable-next-line no-unused-vars
class SettingsManager {
  constructor() {
    this.saveBtn = document.getElementById('save-keys');
    this._initEventListeners();
    this._loadSettings();
  }

  _initEventListeners() {
    // Save API keys
    this.saveBtn.addEventListener('click', () => this._saveKeys());

    // Toggle password visibility
    document.querySelectorAll('.toggle-visibility').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (input) {
          input.type = input.type === 'password' ? 'text' : 'password';
        }
      });
    });
  }

  async _saveKeys() {
    const groqKey = document.getElementById('groq-key').value.trim();
    const geminiKey = document.getElementById('gemini-key').value.trim();
    const openrouterKey = document.getElementById('openrouter-key').value.trim();

    const settings = { apiKeys: {} };
    if (groqKey) settings.apiKeys.groq = groqKey;
    if (geminiKey) settings.apiKeys.gemini = geminiKey;
    if (openrouterKey) settings.apiKeys.openrouter = openrouterKey;

    try {
      await window.jarvis.updateSettings(settings);

      // Visual feedback
      this.saveBtn.textContent = 'Saved!';
      this.saveBtn.style.background = 'linear-gradient(135deg, var(--neon-green), #00aa44)';

      setTimeout(() => {
        this.saveBtn.textContent = 'Save API Keys';
        this.saveBtn.style.background = '';
      }, 2000);

      await this.refreshStatus();
    } catch (error) {
      this.saveBtn.textContent = 'Error!';
      this.saveBtn.style.background = 'linear-gradient(135deg, var(--neon-red), #aa0000)';

      setTimeout(() => {
        this.saveBtn.textContent = 'Save API Keys';
        this.saveBtn.style.background = '';
      }, 2000);

      console.error('Failed to save settings:', error);
    }
  }

  async _loadSettings() {
    await this.refreshStatus();
  }

  async refreshStatus() {
    try {
      const status = await window.jarvis.getAIStatus();

      this._updateStatusCard('status-groq', status.groq);
      this._updateStatusCard('status-gemini', status.gemini);
      this._updateStatusCard('status-openrouter', status.openrouter);
    } catch {
      // Status refresh failed silently
    }
  }

  _updateStatusCard(cardId, providerStatus) {
    const card = document.getElementById(cardId);
    if (!card || !providerStatus) return;

    const stateEl = card.querySelector('.status-card-state');

    card.classList.remove('configured', 'error');

    if (providerStatus.configured && providerStatus.available) {
      card.classList.add('configured');
      stateEl.textContent = 'Connected';
    } else if (providerStatus.configured && !providerStatus.available) {
      card.classList.add('error');
      stateEl.textContent = 'Error';
    } else {
      stateEl.textContent = 'Not configured';
    }
  }
}

// Initialize settings
const settingsManager = new SettingsManager();
