/* ============================================
   JARVIS LITE — App Controller
   Main application logic for the renderer
   ============================================ */

// eslint-disable-next-line no-unused-vars
class JarvisApp {
  constructor() {
    this.currentView = 'chat';
    this.isProcessing = false;
    this._initWindowControls();
    this._initNavigation();
    this._updateAIStatus();
  }

  _initWindowControls() {
    document.getElementById('btn-minimize').addEventListener('click', () => {
      window.jarvis.minimize();
    });

    document.getElementById('btn-maximize').addEventListener('click', () => {
      window.jarvis.maximize();
    });

    document.getElementById('btn-close').addEventListener('click', () => {
      window.jarvis.close();
    });
  }

  _initNavigation() {
    const navButtons = document.querySelectorAll('.sidebar-btn[data-view]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.switchView(view);
      });
    });
  }

  switchView(viewName) {
    document.querySelectorAll('.main-content').forEach(el => {
      el.classList.add('hidden');
    });

    document.querySelectorAll('.sidebar-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const viewEl = document.getElementById(`view-${viewName}`);
    if (viewEl) {
      viewEl.classList.remove('hidden');
    }

    const btnEl = document.querySelector(`.sidebar-btn[data-view="${viewName}"]`);
    if (btnEl) {
      btnEl.classList.add('active');
    }

    this.currentView = viewName;

    if (viewName === 'settings') {
      // eslint-disable-next-line no-undef
      if (typeof settingsManager !== 'undefined') {
        settingsManager.refreshStatus();
      }
    }
  }

  setProcessing(processing) {
    this.isProcessing = processing;
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    const jarvisCore = document.getElementById('jarvis-core');

    if (processing) {
      statusDot.className = 'status-dot thinking';
      statusText.textContent = 'Thinking...';
      jarvisCore.classList.add('thinking');
      jarvisCore.classList.remove('active');
    } else {
      statusDot.className = 'status-dot';
      statusText.textContent = 'Ready';
      jarvisCore.classList.remove('thinking');
      jarvisCore.classList.add('active');
      setTimeout(() => {
        jarvisCore.classList.remove('active');
      }, 2000);
    }
  }

  async _updateAIStatus() {
    try {
      const status = await window.jarvis.getAIStatus();
      const hasConfigured = Object.values(status).some(s => s.configured);
      const statusText = document.querySelector('.status-text');

      if (!hasConfigured) {
        statusText.textContent = 'No AI Keys';
        document.querySelector('.status-dot').className = 'status-dot error';
      }
    } catch {
      // Status check failed silently
    }
  }
}

// Initialize app
const app = new JarvisApp();
