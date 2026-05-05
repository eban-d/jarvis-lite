const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class MemoryManager {
  constructor() {
    this.conversation = [];
    this.maxHistory = 50;
    this.dataDir = this._getDataDir();
    this.memoryFile = path.join(this.dataDir, 'memory.json');
    this._ensureDataDir();
    this._load();
  }

  addMessage(role, content) {
    const entry = {
      role,
      content,
      timestamp: Date.now()
    };

    this.conversation.push(entry);

    if (this.conversation.length > this.maxHistory) {
      this.conversation = this.conversation.slice(-this.maxHistory);
    }

    this._save();
  }

  getConversationHistory() {
    return this.conversation.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  clearConversation() {
    this.conversation = [];
    this._save();
  }

  getLastMessages(count = 10) {
    return this.conversation.slice(-count);
  }

  _getDataDir() {
    try {
      return path.join(app.getPath('userData'), 'data');
    } catch {
      return path.join(__dirname, '../../data');
    }
  }

  _ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  _save() {
    try {
      const data = JSON.stringify({
        conversation: this.conversation,
        lastUpdated: Date.now()
      }, null, 2);
      fs.writeFileSync(this.memoryFile, data, 'utf-8');
    } catch (error) {
      console.error('Failed to save memory:', error.message);
    }
  }

  _load() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        const raw = fs.readFileSync(this.memoryFile, 'utf-8');
        const data = JSON.parse(raw);
        this.conversation = data.conversation || [];
      }
    } catch (error) {
      console.error('Failed to load memory:', error.message);
      this.conversation = [];
    }
  }
}

module.exports = { MemoryManager };
