<div align="center">
  <img src="brokebot_readme.png" alt="brokebot logo" width="120" height="120" />
  
  # 🤖 brokebot - Your Privacy-First AI Assistant
  
  **A ChatGPT clone that runs 100% locally in your browser**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=flat&logo=appwrite&logoColor=white)](https://appwrite.io/)
</div>

---

## 🎯 What is brokebot?

**brokebot** is a privacy-focused ChatGPT alternative that puts **you in control**. Unlike other AI assistants that send your data to remote servers, brokebot runs entirely in your browser using cutting-edge WebLLM technology.

### 🔒 Privacy-First Design
- **100% Local Processing**: Your conversations never leave your device
- **No Data Collection**: We don't see, store, or analyze your chats
- **Offline Capable**: Works without internet after initial setup
- **Open Source**: Fully transparent and auditable code

### 🚀 Powerful Features
- **Multiple AI Models**: Local WebLLM models + API support for OpenAI, Claude, Gemini
- **File Chat**: Upload and discuss .txt/.md files with AI
- **Smart Organization**: Search, filter, and manage conversations
- **Modern UI**: Beautiful, responsive interface built with Shadcn/ui
- **PWA Ready**: Install as a desktop/mobile app

---

## 🏗️ How It Works

### Local-First Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your Browser  │    │   IndexedDB     │    │    WebLLM       │
│                 │    │                 │    │                 │
│  • Conversations│◄──►│  • Local Storage│◄──►│  • AI Models    │
│  • Files        │    │  • Encrypted    │    │  • Local Compute│
│  • Settings     │    │    API Keys     │    │  • No Internet  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### What Stays Local vs. What Goes Online

| Feature | Data Location | Privacy Level |
|---------|---------------|---------------|
| 🔒 **Conversations** | Your browser only | 100% Private |
| 🔒 **Uploaded files** | Your browser only | 100% Private |
| 🔒 **Settings & preferences** | Your browser only | 100% Private |
| 🔒 **Local AI models** | Your browser only | 100% Private |
| 🔒 **Your API keys** | Encrypted in browser | 100% Private |
| 🌐 **Account creation** | Appwrite (optional) | Secure & encrypted |
| 🌐 **Free AI models** | OpenRouter (optional) | Prompts used for training |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **pnpm** 
- **Modern browser** with WebGPU support (Chrome 113+, Edge 113+)
- **4GB+ RAM** (8GB recommended for larger local models)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/voitec/brokebot.git
cd brokebot

# 2. Install dependencies
pnpm install

# 3. Start the development server  
pnpm dev
```

Visit `http://localhost:5173` and start chatting! 🎉

### First Time Setup

1. **Choose your AI model:**
   - 🔒 **Local WebLLM models** (completely private, no internet required)
   - 🌐 **Your own API keys** (OpenAI, Claude, Gemini - private to you)
   - 🌐 **Free models** (OpenRouter - prompts may be used for training)

2. **Optional: Create an account**
   - Enables conversation sync across devices
   - Powered by secure Appwrite backend
   - Can be skipped for full offline usage

---

## 🔧 Authentication Setup (Optional)

### Appwrite Configuration

brokebot uses [Appwrite](https://appwrite.io/) for secure user authentication and optional cloud features. Here's how to set it up:

#### For Users (Simple)
1. Create account directly in the app
2. No additional setup required
3. Account enables conversation sync and sharing

#### For Developers (Self-hosting)

1. **Create Appwrite Project:**
   ```bash
   # Install Appwrite CLI
   npm install -g appwrite-cli
   
   # Login to Appwrite Cloud or your instance
   appwrite login
   
   # Create new project
   appwrite init project
   ```

2. **Configure Environment Variables:**
   ```bash
   # Create .env.local file
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your-project-id
   VITE_APPWRITE_DATABASE_ID=your-database-id
   ```

3. **Set up Database Collections:**
   - Users collection for profiles
   - Conversations collection for sync
   - Shared links collection for sharing

For detailed setup instructions, see our [Appwrite Setup Guide](docs/appwrite-setup.md).

---

## 🎮 Usage Guide

### Getting Started
1. **First launch**: Choose between local models or API keys
2. **Start chatting**: Type your message and press Enter
3. **Upload files**: Drag & drop .txt/.md files for AI to analyze
4. **Organize**: Create, rename, pin, and search conversations

### Model Selection Guide

| Model Type | Privacy | Cost | Performance | Best For |
|------------|---------|------|-------------|----------|
| **WebLLM Local** | 🔒 100% Private | 💰 Free | ⚡ Good | Privacy-focused users |
| **Your API Keys** | 🔒 Private to you | 💰 Pay-per-use | ⚡ Excellent | Power users |
| **Free Models** | 🌐 Shared with provider | 💰 Free | ⚡ Very Good | Casual users |

### File Chat Feature
- **Supported formats**: .txt, .md files
- **Max file size**: 10MB per file
- **How it works**: Upload → AI reads content → Discuss with context
- **Privacy**: Files processed locally, never uploaded to servers

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite** - Modern development stack
- **Tailwind CSS** + **Shadcn/ui** - Beautiful, accessible components
- **Framer Motion** - Smooth animations and transitions

### AI & Storage  
- **@mlc-ai/web-llm** - Local AI model execution
- **Dexie.js** - IndexedDB wrapper for local storage
- **Web Crypto API** - Client-side encryption for API keys

### Backend (Optional)
- **Appwrite** - Authentication and cloud sync
- **OpenRouter** - Access to various AI models

---

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── chat/            # Chat interface components
│   ├── common/          # Shared/reusable components  
│   ├── dialogs/         # Modal dialogs
│   └── ui/              # Base UI components (Shadcn/ui)
├── hooks/               # Custom React hooks
├── lib/                 # Core libraries and utilities
├── pages/               # Page components
├── providers/           # React context providers 
└── types/               # TypeScript type definitions
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch**: `git checkout -b feature/amazing-feature`
4. **Make your changes** following our coding standards
5. **Test thoroughly** and ensure no breaking changes
6. **Submit a pull request** with a clear description

### Development Guidelines

#### Code Standards
- **TypeScript strict mode** - No `any` types allowed
- **English only** - All code, comments, and UI text
- **Component-driven** - Single responsibility principle
- **Test coverage** - Write tests for new features
- **Accessibility first** - WCAG 2.1 compliance

#### Commit Convention
```bash
feat: add new model selection feature
fix: resolve conversation loading issue  
docs: update installation instructions
style: improve mobile responsiveness
refactor: optimize chat component performance
```

### Areas We Need Help With
- 🐛 **Bug fixes** - Check our [issues](https://github.com/voitec/brokebot/issues)
- ✨ **New features** - AI model integrations, UI improvements
- 📚 **Documentation** - Tutorials, guides, API docs
- 🌍 **Translations** - Help make brokebot global
- 🎨 **Design** - UI/UX improvements and themes
- 🧪 **Testing** - Unit tests, integration tests, E2E tests

---

## 📊 Roadmap

### ✅ Current Features (v1.0)
- [x] Local WebLLM model support
- [x] Conversation management
- [x] File upload and chat
- [x] User authentication (Appwrite)
- [x] Responsive design
- [x] PWA support

### 🚀 Coming Soon (v1.1)
- [ ] Image file support
- [ ] Voice conversations
- [ ] Custom model fine-tuning
- [ ] Team collaboration features
- [ ] Advanced conversation search
- [ ] Plugin system

### 🔮 Future Vision (v2.0+)
- [ ] Multi-modal AI (text + image + voice)
- [ ] Local model training
- [ ] Blockchain integration for decentralized AI
- [ ] Advanced privacy features (TOR support)

---

## ❓ FAQ

<details>
<summary><strong>Is brokebot really private?</strong></summary>

Yes! By default, all your conversations, files, and settings stay on your device. Only optional features (account creation and free models) involve any data transmission, and we're completely transparent about what, when, and why.
</details>

<details>
<summary><strong>How much does it cost?</strong></summary>

brokebot is completely free and open source. You only pay if you choose to use your own API keys with providers like OpenAI or Claude.
</details>

<details>
<summary><strong>Which browsers are supported?</strong></summary>

Modern browsers with WebGPU support:
- Chrome 113+
- Edge 113+ 
- Firefox (experimental WebGPU support)
- Safari (limited support)
</details>

<details>
<summary><strong>Can I run brokebot offline?</strong></summary>

Yes! After the initial model download, you can use local WebLLM models completely offline. Your conversations and files are always available.
</details>

<details>
<summary><strong>How do I back up my data?</strong></summary>

Use the export feature in settings to download your conversations as JSON or Markdown files. For automatic backups, create an account to enable cloud sync.
</details>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[MLC-LLM Team](https://github.com/mlc-ai/web-llm)** - Making local AI possible in browsers
- **[Shadcn](https://ui.shadcn.com/)** - Beautiful component library  
- **[Appwrite Team](https://appwrite.io/)** - Secure backend services
- **[OpenRouter](https://openrouter.ai/)** - AI model access platform

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=voitec/brokebot&type=Date)](https://star-history.com/#voitec/brokebot&Date)

## 💬 Community & Support

- **[GitHub Discussions](https://github.com/voitec/brokebot/discussions)** - Questions and ideas
- **[Issues](https://github.com/voitec/brokebot/issues)** - Bug reports and feature requests
- **[Twitter](https://twitter.com/voitec)** - Updates and announcements
- **Email**: support@voitec.dev

---

<div align="center">
  <strong>Built with ❤️ for privacy, freedom, and the open source community</strong>
  
  [⭐ Star us on GitHub](https://github.com/voitec/brokebot) • [🚀 Try brokebot](https://brokebot.voitz.dev) • [📖 Documentation](docs/)
</div>
