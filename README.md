# 🤖 Local-GPT - Privacy-First, Browser-Powered AI Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=flat&logo=appwrite&logoColor=white)](https://appwrite.io/)

A privacy-focused ChatGPT clone that runs **100% locally in your browser** using WebLLM. It also supports connecting to external API providers like OpenAI, Google, and Anthropic. All data and keys are stored securely on your device.

## ✨ Core Features

- 🔒 **Complete Privacy**: All local processing and storage stay on your device. API keys are encrypted and never leave your browser.
- 🌐 **Works Offline**: Use local WebLLM models without an internet connection after the initial download.
- 🤖 **Hybrid Model Support**:
  - **Local Models**: Run 120+ WebLLM models directly in your browser.
  - **Online Models**: Connect your own API keys for OpenAI (GPT-4o), Google (Gemini), Anthropic (Claude 3.5), and any OpenRouter compatible model.
- 💾 **Secure, Persistent Storage**: Conversations and encrypted API keys are saved locally with IndexedDB.
- 🎨 **Modern UI**: A beautiful, responsive interface built with Shadcn/ui and Tailwind CSS.
- 🔍 **Smart Search & Filtering**: Easily find conversations and models.
- 📎 **File Uploads**: Attach and discuss text files and images (coming soon).
- 🔗 **Share & Export**: Export conversations to JSON or markdown.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and `pnpm`
- A modern browser with WebGPU support (e.g., Chrome 113+, Edge 113+).
- At least 4GB of RAM (8GB+ recommended for larger local models).

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/local-gpt.git
cd local-gpt

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

Visit `http://localhost:5173` to start chatting!

## 🏗️ How It Works

### Local-First Architecture

- **WebLLM**: Utilizes WebAssembly and WebGPU to run large language models directly in the browser. Models are downloaded and cached in IndexedDB for offline use.
- **IndexedDB & Dexie.js**: All conversations and application settings are stored client-side.
- **Web Crypto API**: API keys for online providers are encrypted using strong, native browser encryption (AES-256) before being stored in IndexedDB. They are decrypted only in memory when needed for an API call.

### Optional Backend Services (Appwrite)

For cloud-based features like cross-device sync or conversation sharing, Local-GPT uses [Appwrite](https://appwrite.io/), an open-source backend-as-a-service.

- **User Authentication**: Secure accounts for cloud features.
- **Cloud Sync**: Sync conversations and settings across devices (opt-in Pro feature).
- **Secure Server-Side Functions**: For handling integrations like payment processing (e.g., RevenueCat).

**All cloud features are optional.** The application is fully functional for local and online models without ever connecting to a backend.

## 🛠️ Tech Stack

### Frontend

- **Framework**: Vite + React 18 + TypeScript
- **UI**: Tailwind CSS, Shadcn/ui, Radix UI
- **State Management**: React Hooks & Context
- **Routing**: `react-router-dom` (for future multi-page layouts)

### AI & Storage

- **Local AI**: `@mlc-ai/web-llm`
- **Database**: Dexie.js (IndexedDB Wrapper)
- **Encryption**: Native Web Crypto API (AES-256)

### Development

- **Testing**: Vitest, React Testing Library
- **Linting & Formatting**: ESLint, Prettier

## 📁 Project Structure

```
src/
├── components/    # UI components (chat, dialogs, layout, etc.)
├── hooks/         # Custom React hooks (e.g., useUserConfig, useSmartAutoScroll)
├── lib/           # Core libraries (db.ts, encryption.ts, openrouter.ts)
├── providers/     # React Context providers (e.g., WebLLMProvider)
└── main.tsx       # App entry point
```

## 🤝 Contributing

We welcome contributions! Please follow the standard fork-and-pull-request workflow.

### 📋 Coding Standards

- **Language**: English only in code and UI.
- **Architecture**: Strive for Single Responsibility Principle. Extract complex logic into custom hooks.
- **Styling**: Use Tailwind CSS utility classes. Avoid custom CSS where possible.
- **Types**: Use TypeScript strict mode. No `any` types.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **[MLC-LLM Team](https://github.com/mlc-ai/web-llm)** - For making local AI possible
- **[Shadcn](https://twitter.com/shadcn)** - For the beautiful component library
- **[Appwrite Team](https://appwrite.io/)** - For the excellent backend services
- **[Vercel](https://vercel.com/)** - For the amazing deployment platform

## 🌟 Star History

If you like this project, please consider giving it a star! It helps us understand the project's impact and motivates continued development.

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/local-gpt&type=Date)](https://star-history.com/#yourusername/local-gpt&Date)

## 💬 Community

- **[GitHub Discussions](https://github.com/yourusername/local-gpt/discussions)** - General questions and ideas
- **[Discord Server](https://discord.gg/your-invite)** - Real-time chat and support
- **[Twitter](https://twitter.com/your-handle)** - Updates and announcements

---

<div align="center">
  <strong>Built with vibes and ❤️ for privacy and open source</strong> 
</div>
