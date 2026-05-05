# JARVIS LITE

**Your Personal AI, Powered by Intelligence, Not Money.**

A next-generation desktop AI assistant that integrates multiple AI providers (Groq, Google Gemini, OpenRouter) to deliver intelligent, free-to-use conversational AI with a futuristic interface.

![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron)
![License](https://img.shields.io/badge/License-MIT-blue)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

---

## Features

### Multi-AI Brain System
- **Groq** — Lightning-fast responses using Llama 3.3 70B
- **Google Gemini** — Deep reasoning with Gemini 2.0 Flash
- **OpenRouter** — Backup models with free tier support
- Automatic fallback when one provider hits rate limits

### Smart Routing
Queries are automatically routed to the best AI provider:
- **Coding questions** → Groq (fast, accurate code generation)
- **Reasoning & analysis** → Gemini (deep thinking)
- **Creative writing** → Gemini (narrative and creative tasks)
- **General chat** → Groq (quick, conversational)

### Command Execution
Built-in system commands:
- `time`, `date`, `day` — Current time/date info
- `system info` — System hardware and OS details
- `open youtube`, `open google.com` — Launch websites
- `search [query]` — Google search
- `help` — View all commands

### Futuristic UI
- Dark theme with neon cyan/blue/purple glow effects
- Animated Jarvis-style core (rotating rings)
- Smooth message animations
- Markdown rendering with syntax-highlighted code blocks
- Custom frameless window with title bar controls

### Conversation Memory
- Persistent chat history stored locally as JSON
- Context-aware responses using conversation history
- Clear/reset conversation anytime

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- npm v8 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/eban-d/jarvis-lite.git
cd jarvis-lite

# Install dependencies
npm install

# Start the app
npm start
```

### Configuration

1. Launch the app and navigate to **Settings**
2. Enter your API keys:
   - **Groq**: Get a free key at [console.groq.com](https://console.groq.com)
   - **Gemini**: Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - **OpenRouter**: Get a free key at [openrouter.ai/keys](https://openrouter.ai/keys)
3. Click **Save API Keys**

You can also set keys via environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

---

## Architecture

```
User Interface (Electron App)
        ↓
Command & Routing Engine
        ↓
Multi-AI System
   ├── Groq (fast responses)
   ├── Gemini (deep reasoning)
   └── OpenRouter (backup models)
        ↓
Response Processing
        ↓
UI Output (Chat + System Feedback)
```

### Project Structure

```
jarvis-lite/
├── src/
│   ├── main/
│   │   ├── main.js          # Electron main process
│   │   └── preload.js       # Context bridge (IPC)
│   ├── renderer/
│   │   ├── index.html        # Main UI
│   │   ├── css/
│   │   │   ├── main.css      # Core styles & dark theme
│   │   │   ├── animations.css # Glow & motion effects
│   │   │   ├── chat.css      # Chat message styles
│   │   │   └── settings.css  # Settings page styles
│   │   └── js/
│   │       ├── app.js        # App controller
│   │       ├── chat.js       # Chat messaging
│   │       ├── markdown.js   # Markdown renderer
│   │       └── settings.js   # Settings manager
│   └── services/
│       ├── aiRouter.js       # Smart routing engine
│       ├── commandEngine.js  # System command handler
│       ├── memoryManager.js  # Conversation persistence
│       └── providers/
│           ├── groqProvider.js
│           ├── geminiProvider.js
│           └── openRouterProvider.js
├── package.json
├── .env.example
└── README.md
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Electron 33 |
| Frontend | HTML, CSS, JavaScript |
| Backend Logic | Node.js |
| AI Providers | Groq, Google Gemini, OpenRouter |
| Storage | Local JSON files |

---

## Building

```bash
# Build for current platform
npm run build

# Create distributable
npm run dist
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**"Jarvis Lite — Your Personal AI, Powered by Intelligence, Not Money."**
