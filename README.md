<div align="center">
  <img src="https://raw.githubusercontent.com/voitb/brokebot/main/public/brokebot_readme.png" alt="brokebot logo" width="120" height="120" />
  
  # 🤖 brokebot - Your Free, Private AI Assistant
  
  **A flexible ChatGPT clone that runs locally with WebLLM or connects to powerful online models.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=flat&logo=appwrite&logoColor=white)](https://appwrite.io/)
</div>

> **⚠️ A Note on "Broke":** This project is a work-in-progress. The name isn't just about providing free AI models, but also a nod to the fact that it's a bit... well, "broke". It was often coded purely on vibes, which I've learned is not the most sustainable development strategy.
> 
> That said, it's actively maintained and being improved. Known issues are tracked in the [GitHub Issues](https://github.com/voitb/brokebot/issues). Your feedback and contributions are welcome!

---

## �� What is brokebot?

**brokebot** is a versatile, privacy-focused ChatGPT alternative that puts **you in control**. It offers a hybrid approach:
- **Run 100% locally** in your browser for absolute privacy with **WebLLM**.
- **Access powerful online AI models** for free through **OpenRouter**, with the understanding that prompts may be used for model training.

### 🔑 Core Principles
- **Free First**: Core features, including access to powerful models, are free.
- **Privacy by Default**: Your data stays on your device when using local models.
- **Full Transparency**: We are clear about when data is sent to third-party services.
- **Open Source**: Fully auditable code for your peace of mind.

###  Powerful Features
- **Multiple AI Models**: Local WebLLM models + API support for OpenAI, Claude, Gemini
- **File Chat**: Upload and discuss .txt/.md files with AI
- **Smart Organization**: Search, filter, and manage conversations
- **Modern UI**: Beautiful, responsive interface built with Shadcn/ui
- **PWA Ready**: Install as a desktop/mobile app

### Key Features & Current Limitations
- **Text & Code Generation**: The AI can generate text and format code snippets using Markdown.
- **File Chat**: You can upload `.txt` and `.md` files for the AI to analyze and discuss. Support for other formats (like PDFs and images) is planned for the future.
- **Max File Size**: 10MB per file.
- **How it works**: Upload → AI reads content → Discuss with context.
- **Privacy**: All files are processed locally in your browser and are never uploaded to any server.

---

## 🏗️ How It Works

brokebot's architecture is designed for flexibility, allowing you to choose between complete privacy and the power of cloud-based AI models.

### Local-First Architecture with Online Model Proxy
```
┌─────────────────┐    ┌─────────────────┐    ┌────────────────────┐
│   Your Browser  │    │   IndexedDB     │    │    WebLLM Engine   │
│ (React UI)      │    │ (Local Storage) │    │   (Local AI Model) │
│                 │◄───►│ • Conversations │◄───►│ • 100% Offline   │
│ • Chat Interface│    │ • Files         │    │ • Runs on Device   │
│ • Settings      │    │ • API Keys      │    │                    │
└───────┬─────────┘    └─────────────────┘    └────────────────────┘
        │
        │ (If using Free Online Models)
        ▼
┌─────────────────┐    ┌─────────────────┐
│ Appwrite Proxy  │    │  OpenRouter AI  │
│ (proxy-ai func) │    │ (Online Models) │
│                 │───►│                 │
│ • Secure Proxy  │    │ • Free Models   │
│ • No logging    │    │ • Learns from   │
│                 │    │   prompts       │
└─────────────────┘    └─────────────────┘
```

### What Stays Local vs. What Goes Online

| Feature | Data Location | Privacy Level & Notes |
|---------|---------------|-----------------------|
| 🔒 **Local AI Models (WebLLM)** | Your browser only | **100% Private.** No data ever leaves your device. |
| 🌐 **Free AI Models (OpenRouter)** | Sent to OpenRouter via our secure proxy | **Prompts may be used for training by the model provider.** This is the trade-off for free access. Our proxy does not log your conversations. |
| 🔜 **Your API Keys (Coming Soon)** | Your browser ↔ AI Provider | **Private to you.** Your keys will be encrypted and sent directly from your browser or via our secure proxy. |
| 🔜 **Cloud Sync (Coming Soon)** | Your browser ↔ Appwrite | **Optional.** End-to-end encrypted backup and sync of your conversations. |
| 🔒 **Uploaded Files** | Your browser only | **100% Private.** Files are read and processed locally. |
| 🔒 **Settings & Preferences** | Your browser only | **100% Private.** |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **pnpm** 
- **Modern browser** with WebGPU support (Chrome 113+, Edge 113+)
- **4GB+ RAM** (8GB recommended for larger local models)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/voitb/brokebot.git
cd brokebot

# 2. Install dependencies
pnpm install

# 3. Start the development server  
pnpm dev
```

Visit `http://localhost:5173` and start chatting! 🎉

### First Time Setup

1. **Choose your AI model:**
   - 🔒 **Local WebLLM models** (completely private, works offline after first download)
   - 🌐 **Free Online models (via OpenRouter)** (powerful, but prompts may be used for training)

2. **Coming Soon:**
   - 🔜 **Your own API keys**: Connect to OpenAI, Claude, Gemini, and more.
   - 🔜 **Paid OpenRouter models**: Access to premium, cutting-edge models.
   - 🔜 **Cloud sync**: Create an optional account to sync conversations across devices.

---

## 🔧 Authentication Setup (Optional)

**Note:** If you only plan to use local WebLLM models and do not need cloud sync or online models, you can skip the Appwrite setup entirely. brokebot will run in a 100% local, offline-first mode.

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

For detailed setup instructions, see the [Self-Hosting Appwrite Functions](#self-hosting-appwrite-functions) section below.

---

## 🏗️ Self-Hosting Appwrite Functions

If you want to run your own instance of brokebot with full control over the backend, you'll need to deploy the Appwrite functions included in this repository.

### Prerequisites for Self-Hosting

- **Appwrite instance** (self-hosted or Appwrite Cloud)
- **Appwrite CLI** installed and configured
- **Node.js 18+** for function development

### Function Overview

brokebot uses two Appwrite functions:

1.  **`encrypt-keys`** - Handles secure encryption/decryption of API keys (for future features).
2.  **`proxy-ai`** - Proxies requests to AI providers (like OpenRouter) to protect the app's API keys and enable rate limiting.

### Deployment Steps

**Important Note on Function Deployment:** When you deploy a function using the Appwrite CLI or in the Appwrite Console, you must configure the paths correctly. The **root directory** for the function must be set to its specific folder (e.g., `appwrite/encrypt-keys` or `appwrite/proxy-ai`). The **entrypoint command** should then be `src/index.js`. This structure is crucial because it allows Appwrite's build service to find the `package.json` in the function's root and automatically install the required Node.js dependencies.

The commands below should be run from within the respective function's directory. All these steps can also be performed manually through the Appwrite Console (web UI) if you prefer a graphical interface over the command line.

#### 1. Install Appwrite CLI

```bash
npm install -g appwrite-cli
```

#### 2. Login to Your Appwrite Instance

```bash
# For Appwrite Cloud
appwrite login

# For self-hosted Appwrite
appwrite login --endpoint https://your-appwrite-instance.com/v1
```

#### 3. Initialize Appwrite Project

```bash
# Navigate to your brokebot directory
cd brokebot

# Initialize Appwrite project (if not already done)
appwrite init project
```

#### 4. Deploy the Encryption Function

```bash
# Navigate to encrypt-keys function directory
cd appwrite/encrypt-keys

# Deploy the function definition
appwrite functions create \
  --functionId encrypt-keys \
  --name "Encrypt Keys" \
  --runtime "node-18.0" \
  --entrypoint "src/index.js" \
  --timeout 30

# Deploy the code with dependencies
appwrite functions createDeployment \
  --functionId encrypt-keys \
  --entrypoint "src/index.js" \
  --code . \
  --activate true

# IMPORTANT: Go back to the project root
cd ../..
```

#### 5. Deploy the AI Proxy Function

```bash
# Navigate to proxy-ai function directory
cd appwrite/proxy-ai

# Deploy the function definition
appwrite functions create \
  --function-id proxy-ai \
  --name "AI Proxy" \
  --runtime "node-18.0" \
  --entrypoint "src/index.js" \
  --timeout 300

# Deploy the code with dependencies
appwrite functions createDeployment \
  --function-id proxy-ai \
  --entrypoint "src/index.js" \
  --code . \
  --activate true

# IMPORTANT: Go back to the project root
cd ../..
```

#### 6. Set Environment Variables

Both functions require environment variables for security:

```bash
# For encrypt-keys function
appwrite functions updateVariable \
  --functionId encrypt-keys \
  --key MASTER_ENCRYPTION_KEY \
  --value "your-super-secure-master-key-here"

# For proxy-ai function  
appwrite functions updateVariable \
  --functionId proxy-ai \
  --key APPWRITE_FUNCTION_ENDPOINT \
  --value "https://your-appwrite-instance.com/v1"

appwrite functions updateVariable \
  --functionId proxy-ai \
  --key APPWRITE_FUNCTION_PROJECT_ID \
  --value "your-project-id"

appwrite functions updateVariable \
  --functionId proxy-ai \
  --key APPWRITE_API_KEY \
  --value "your-api-key"

appwrite functions updateVariable \
  --functionId proxy-ai \
  --key APP_URL \
  --value "https://your-brokebot-domain.com"

appwrite functions updateVariable \
  --functionId proxy-ai \
  --key APP_TITLE \
  --value "Your brokebot Instance"
```

#### 7. Configure Database Collections

Create the required collections in your Appwrite database:

```bash
# Create conversations collection
appwrite databases createCollection \
  --databaseId your-database-id \
  --collectionId conversations \
  --name "Conversations"

# Create messages collection  
appwrite databases createCollection \
  --databaseId your-database-id \
  --collectionId messages \
  --name "Messages"

# Create user config collection
appwrite databases createCollection \
  --databaseId your-database-id \
  --collectionId userConfig \
  --name "User Config"
```

#### 8. Update Frontend Configuration

Update your `.env.local` file with your Appwrite instance details:

```bash
VITE_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_APPWRITE_DATABASE_ID=your-database-id
```

### Security Considerations

- **Master Encryption Key**: Generate a strong, random key (32+ characters) for `MASTER_ENCRYPTION_KEY`
- **API Key Permissions**: Use a server API key with minimal required permissions
- **HTTPS Only**: Always use HTTPS for your Appwrite instance and brokebot deployment
- **Regular Updates**: Keep your Appwrite instance and functions updated

### Function Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │ encrypt-keys    │    │   proxy-ai      │
│                 │    │                 │    │                 │
│ • Encrypts keys │───►│ • Re-encrypts   │◄───│ • Decrypts keys │
│   locally       │    │   with master   │    │ • Calls AI APIs │
│ • Sends to AI   │    │   key           │    │ • Returns result│
│   proxy         │    │ • User-specific │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

This architecture ensures that:
- API keys are encrypted both locally and on the server
- Each user has unique encryption keys
- The master key never leaves the server environment
- All encryption is transparent and auditable

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
| **WebLLM Local** | 🔒 100% Private | 💰 Free | ⚡ Good | Privacy-focused users, offline use. |
| **Free Models (OpenRouter)** | 🌐 Shared with provider | 💰 Free | ⚡ Very Good | Casual users. Prompts may be used for model training. |
| **Your API Keys (Coming Soon)** | 🔒 Private to you | 💰 Pay-per-use | ⚡ Excellent | Power users wanting to use their own accounts. |

### Key Features & Current Limitations
- **Text & Code Generation**: The AI can generate text and format code snippets using Markdown.
- **File Chat**: You can upload `.txt` and `.md` files for the AI to analyze and discuss. Support for other formats (like PDFs and images) is planned for the future.
- **Max File Size**: 10MB per file.
- **How it works**: Upload → AI reads content → Discuss with context.
- **Privacy**: All files are processed locally in your browser and are never uploaded to any server.

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
- **AES-256-GCM** - Server-side encryption with PBKDF2 key derivation

### Backend (Optional)
- **Appwrite** - Authentication and cloud sync
- **OpenRouter** - Access to various AI models

### How You Can Help
Your feedback is crucial for making brokebot better!
- 🚀 **Create an Account**: This is one of the best ways to support the project! User registrations and github stars are a key metric that shows the project is valued by the community, which directly motivates me to continue development and the rollout of new features (like free cloud sync, coming soon!).
- 🐛 **Report Bugs**: If you find a bug, please [create an issue](https://github.com/voitb/brokebot/issues) with a detailed description and steps to reproduce it.
- ✨ **Suggest Features**: Have a great idea? [Open an issue](https://github.com/voitb/brokebot/issues) and tell us about it.
- 👨‍💻 **Contribute Code**: Check our [issues](https://github.com/voitb/brokebot/issues) for tasks labeled `help-wanted` or `good-first-issue`.
- 📚 **Improve Documentation**: Found a typo or something unclear? Let us know!
- 🌍 **Translate**: Help bring brokebot to more users around the world.

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
- 🐛 **Bug fixes** - Check our [issues](https://github.com/voitb/brokebot/issues)
- ✨ **New features** - AI model integrations, UI improvements
- 📚 **Documentation** - Tutorials, guides, API docs
- 🌍 **Translations** - Help make brokebot global
- 🎨 **Design** - UI/UX improvements and themes
- 🧪 **Testing** - Unit tests, integration tests, E2E tests

---

## 📊 Roadmap

### ✅ Current Features (v1.0)
- [x] Local WebLLM model support
- [x] Free online models via OpenRouter
- [x] Conversation management
- [x] File upload and chat
- [x] User authentication (Appwrite)
- [x] Responsive design
- [x] PWA support
- [ ] Cloud sync & sharing
- [ ] Image file support
- [ ] Voice conversations
- [ ] Custom model fine-tuning

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

### 💻 Development Pace & Project Status

This project is developed and maintained by a single person in their free time, mainly for personal use. This means development may not be rapid, but **the project is actively maintained and will not be abandoned.**

Please be aware that this is a work-in-progress. You may encounter bugs or other issues. Known bugs are tracked in the [GitHub Issues](https://github.com/voitb/brokebot/issues). Your patience and contributions are highly appreciated.

We are committed to transparency. A public project board with our task list and development pipeline is **coming soon!** This will allow you to see what we're working on and what's next.

---

## ❓ FAQ

<details>
<summary><strong>Is brokebot really private?</strong></summary>

Yes! By default, all your conversations, files, and settings stay on your device. Only optional features (account creation and free models) involve any data transmission, and we're completely transparent about what, when, and why.
</details>

<details>
<summary><strong>How much does it cost?</strong></summary>

brokebot is completely free and open source. You only pay if you choose to use your own API keys with providers like OpenAI or Claude, and using additional features that are provided in billing plans.
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

[![Star History Chart](https://api.star-history.com/svg?repos=voitb/brokebot&type=Date)](https://star-history.com/#voitb/brokebot&Date)

## 💬 Community & Support

- **[GitHub Discussions](https://github.com/voitb/brokebot/discussions)** - Questions and ideas
- **[Issues](https://github.com/voitb/brokebot/issues)** - Bug reports and feature requests
- **[Twitter](https://x.com/voitz__)** - Updates and announcements
- **Email**: v017dev@gmail.com

---

<div align="center">
  <strong>Built with ❤️ for all my broke brothers and sisters privacy, freedom, and the open source community</strong>
  
  [⭐ Star us on GitHub](https://github.com/voitb/brokebot) • [🚀 Try brokebot](https://brokebot.voitz.dev) • [📖 Documentation](docs/)
</div>
