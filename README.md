<div align="center">
  <img src="https://raw.githubusercontent.com/voitb/brokebot/main/public/brokebot_readme.png" alt="brokebot logo" width="120" height="120" />

  # brokebot - Your Free, Private AI Assistant

  **A privacy-first ChatGPT alternative that runs locally with WebLLM or connects to online models.**

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
</div>

---

## What is brokebot?

**brokebot** is a privacy-focused ChatGPT alternative that puts **you in control**:

- **Run 100% locally** in your browser with **WebLLM** - complete privacy, works offline
- **Access powerful online AI models** through **OpenRouter** for free
- **Your own API keys** - connect to OpenAI, Claude, Gemini directly

### Core Principles

- **Privacy by Default** - All data stays on your device (IndexedDB)
- **Free First** - Core features including powerful models are free
- **Open Source** - Fully auditable code
- **Offline Ready** - Works without internet using local models

### Features

- **Multiple AI Models** - Local WebLLM + API support for OpenAI, Claude, Gemini
- **File Chat** - Upload and discuss .txt/.md files with AI
- **Smart Organization** - Search, filter, and manage conversations
- **Export Options** - Export chats as HTML, JSON, or Markdown
- **Modern UI** - Beautiful interface built with Shadcn/ui
- **PWA Ready** - Install as desktop/mobile app

---

## How It Works

brokebot runs entirely in your browser with all data stored locally.

```
┌─────────────────┐    ┌─────────────────┐    ┌────────────────────┐
│   Your Browser  │    │   IndexedDB     │    │    WebLLM Engine   │
│ (React UI)      │    │ (Local Storage) │    │   (Local AI Model) │
│                 │◄───►│ • Conversations │◄───►│ • 100% Offline     │
│ • Chat Interface│    │ • Files         │    │ • Runs on Device   │
│ • Settings      │    │ • API Keys      │    │                    │
└───────┬─────────┘    └─────────────────┘    └────────────────────┘
        │
        │ (Optional: Online Models)
        ▼
┌─────────────────┐
│  OpenRouter AI  │
│ (Online Models) │
│ • Free Models   │
│ • Premium API   │
└─────────────────┘
```

### Privacy Model

| Feature | Data Location | Privacy |
|---------|---------------|---------|
| **Local AI (WebLLM)** | Your browser only | 100% Private |
| **Free Models (OpenRouter)** | Sent to provider | Prompts may be used for training |
| **Your API Keys** | Your browser → Provider | Private to you |
| **Uploaded Files** | Your browser only | 100% Private |
| **Conversations** | Your browser only | 100% Private |

---

## Quick Start

### Prerequisites

- **Node.js 18+** and **pnpm**
- **Modern browser** with WebGPU support (Chrome 113+, Edge 113+)
- **4GB+ RAM** (8GB recommended for larger local models)

### Installation

```bash
# Clone the repository
git clone https://github.com/voitb/brokebot.git
cd brokebot

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:5173` and start chatting!

### First Time Setup

1. **Choose your AI model:**
   - **Local WebLLM** - Completely private, works offline after first download
   - **Free OpenRouter** - Powerful, but prompts may be used for training
   - **Your API Keys** - Connect OpenAI, Claude, Gemini with your own accounts

---

## Usage Guide

### Model Selection

| Model Type | Privacy | Cost | Best For |
|------------|---------|------|----------|
| **WebLLM Local** | 100% Private | Free | Privacy-focused, offline use |
| **Free OpenRouter** | Shared with provider | Free | Casual users |
| **Your API Keys** | Private to you | Pay-per-use | Power users |

### File Chat

- **Supported Formats**: .txt and .md files
- **Max File Size**: 10MB per file
- **How it works**: Upload → AI reads content → Discuss with context
- **Privacy**: All files processed locally, never uploaded

### Export Options

Export conversations as:
- **HTML** - Styled, shareable document
- **JSON** - Full data backup
- **Markdown** - Plain text format

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Shadcn/ui**
- **Framer Motion** - Animations

### AI & Storage
- **@mlc-ai/web-llm** - Local AI execution
- **Dexie.js** - IndexedDB wrapper
- **Web Crypto API** - API key encryption

---

## Project Structure

```
src/
├── components/           # React components
│   ├── chat/            # Chat interface
│   ├── common/          # Shared components
│   ├── dialogs/         # Modal dialogs
│   └── ui/              # Base UI (Shadcn/ui)
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities
├── pages/               # Page components
├── providers/           # React context providers
└── types/               # TypeScript definitions
```

---

## Contributing

### Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes following our standards
5. Test thoroughly
6. Submit a pull request

### Code Standards

- **TypeScript strict mode** - No `any` types
- **English only** - All code, comments, UI text
- **Component-driven** - Single responsibility principle
- **Test coverage** - Write tests for new features
- **Accessibility** - WCAG 2.1 compliance

### Areas for Contribution

- Bug fixes - Check [issues](https://github.com/voitb/brokebot/issues)
- New features - AI model integrations, UI improvements
- Documentation - Tutorials, guides
- Testing - Unit tests, E2E tests
- Translations

---

## FAQ

<details>
<summary><strong>Is brokebot really private?</strong></summary>

Yes! All conversations, files, and settings stay on your device by default. Only when you use online models (OpenRouter or your own API keys) is data transmitted.
</details>

<details>
<summary><strong>Can I run brokebot offline?</strong></summary>

Yes! After the initial model download, local WebLLM models work completely offline.
</details>

<details>
<summary><strong>How do I back up my data?</strong></summary>

Use the export feature in settings to download conversations as JSON or Markdown files.
</details>

---

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [MLC-LLM Team](https://github.com/mlc-ai/web-llm) - Local AI in browsers
- [Shadcn](https://ui.shadcn.com/) - Component library
- [OpenRouter](https://openrouter.ai/) - AI model access

---

<div align="center">
  <strong>Built with privacy first</strong>

  [Star us on GitHub](https://github.com/voitb/brokebot) • [Try brokebot](https://brokebot.voitz.dev)
</div>
