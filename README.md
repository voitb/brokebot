<div align="center">
  <img src="https://raw.githubusercontent.com/voitb/brokebot/main/docs/brokebot_readme.png" alt="brokebot logo" width="120" height="120" />

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

- **Run locally** in your browser with **WebLLM** - local chats never leave your device
- **Or use online models** through **OpenRouter** - both its zero-cost and its paid models
- **Bring your own key** - brokebot ships no API key; every online model runs on your own OpenRouter account, and your key is encrypted in your browser

### Core Principles

- **Privacy by Default** - Conversations, files and settings stay on your device (IndexedDB)
- **No Paywall** - Local models cost nothing; online models bill your own OpenRouter account
- **Open Source** - Fully auditable code
- **Offline After First Visit** - The app shell is cached by a service worker, and a downloaded local model keeps answering with no connection

### Features

- **Multiple AI Models** - Local WebLLM + online models through OpenRouter
- **File Chat** - Attach .txt/.md files and discuss them
- **Voice Input** - Dictate messages with Whisper (`onnx-community/whisper-base`), downloaded once from Hugging Face and cached by the browser
- **Smart Organization** - Search, filter, and manage conversations
- **Export Options** - Export chats as JSON
- **Modern UI** - Interface built with Shadcn/ui
- **Installable** - Add it to your desktop or home screen as a PWA

---

## How It Works

brokebot runs in your browser and keeps every conversation there. Nothing leaves the device unless you select an online model.

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
│ • Your API key  │
│ • Zero-cost or  │
│   paid models   │
└─────────────────┘
```

### Privacy Model

| Feature | Data Location | Privacy |
|---------|---------------|---------|
| **Local AI (WebLLM)** | Your browser only | 100% Private |
| **Online models (OpenRouter)** | Prompt sent to the provider | Zero-cost models may log prompts for training |
| **Your API Keys** | Encrypted in your browser → Provider | Private to you |
| **Attached Files** | Your browser with local models; sent inside the prompt with online models | Private only while you stay local |
| **Conversations** | Your browser only with local models; the last 10 messages are sent with your prompt to OpenRouter with online models | Private only while you stay local |

---

## Quick Start

### Prerequisites

- **Node.js 20.19+** (22 recommended) and **pnpm 11**
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

### Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Vite dev server |
| `pnpm test` | Vitest in watch mode |
| `pnpm lint` | ESLint over the repo |
| `pnpm typecheck:all` | Type-check app and test projects |
| `pnpm build` | Type-check and build to `dist/` |
| `pnpm check` | Type-check, lint, `test:run` and build, in that order |

### Docker

```bash
docker build -t brokebot .
docker run -p 8080:80 brokebot
```

The image serves the static build through nginx on port 80.

### First Time Setup

1. **Choose your AI model:**
   - **Local WebLLM** - Completely private; works offline once the model is downloaded
   - **OpenRouter** - Larger models; add your own API key in Settings first, then pick a zero-cost or paid model

---

## Usage Guide

### Model Selection

| Model Type | Privacy | Cost | Best For |
|------------|---------|------|----------|
| **WebLLM Local** | 100% Private | Free | Privacy-focused, offline use |
| **OpenRouter zero-cost** | Shared with provider | Free on your own account | Bigger models without a bill |
| **OpenRouter paid** | Shared with provider | Pay-per-use on your own account | Frontier models |

Both OpenRouter rows need your own API key - there is no shared brokebot key.

### File Chat

- **Supported Formats**: .txt and .md files
- **Max File Size**: 10MB per file; only the first 200,000 characters of a file are sent, and attachments over the per-message budget stay attached for the next message
- **How it works**: Upload → AI reads content → Discuss with context
- **Privacy**: File contents stay in the browser with a local model; with an online model they are sent to OpenRouter inside the prompt

### Export Options

Export conversations as:
- **JSON** - Full data backup

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript 5.8** + **Vite 6**
- **Tailwind CSS 4** + **Shadcn/ui** (Radix primitives)
- **React Router 7** + **Vitest 4** / Testing Library

### AI & Storage
- **@mlc-ai/web-llm** - Local AI execution
- **@huggingface/transformers** - Whisper speech-to-text in a worker
- **Dexie.js 4** - IndexedDB wrapper
- **Web Crypto API** - API key encryption
- **Zod 3** - Runtime validation

### Scale

- **253 files** under `src/` — 252 `.ts`/`.tsx` plus one `.css`, of which **59** are
  colocated `*.test.ts(x)` files and **36** are `use-*.ts` hooks
- Measured 2026-09-12 with `find src -type f | wc -l`,
  `find src -type f \( -name '*.test.ts' -o -name '*.test.tsx' \) | wc -l` and
  `find src -type f -name 'use-*.ts' ! -name '*.test.ts' | wc -l`

---

## Project Structure

```
src/
├── app/                 # Entry point, router, providers, routes, modals
├── assets/              # Global styles
├── components/          # Shared components
│   ├── errors/          # Error boundaries
│   ├── layouts/         # Layout shells
│   ├── seo/             # Document head tags
│   └── ui/              # Base UI (Shadcn/ui)
├── config/              # Static configuration
├── features/            # Feature modules (chat, documents, onboarding, settings)
├── hooks/               # Shared React hooks
├── lib/                 # Database, encryption, schemas
├── testing/             # Test setup, mocks and factories
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

Conversations, attached files and settings live in your browser's IndexedDB and are never uploaded on their own. The moment you pick an online model, the prompt - including the last few messages of the conversation and the text of any attached file - goes to OpenRouter under your own API key. Local WebLLM models send nothing anywhere.
</details>

<details>
<summary><strong>Can I run brokebot offline?</strong></summary>

Mostly. The service worker precaches the app shell, so brokebot loads with no connection after the first visit, and a local WebLLM model keeps answering once its weights are cached. The first visit, the first model download and every online model still need the network.
</details>

<details>
<summary><strong>How do I back up my data?</strong></summary>

Use the export feature in settings to download conversations as JSON files.
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
