# 🤖 Local-GPT - Privacy-First AI Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

A privacy-focused ChatGPT clone that runs **100% locally** in your browser using WebLLM and IndexedDB. No data leaves your device, no API keys required for local models, completely free to use.

## ✨ Features

- 🔒 **Complete Privacy** - All data stays on your device
- 🌐 **Works Offline** - No internet required after initial load
- 🤖 **120+ AI Models** - From 135M to 70B parameters
- 💾 **Persistent Storage** - Conversations saved locally with IndexedDB
- 🎨 **Modern UI** - Beautiful interface built with Shadcn/ui
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🔍 **Smart Search** - Find conversations and filter models easily
- 🎯 **Vision Models** - Upload and analyze images with VLM models
- 📎 **File Uploads** - Attach text files and images to conversations
- 🔗 **Share Conversations** - Export and share chats with others
- ⛓️ **NFT Minting** - Mint conversations as NFTs (Premium feature)
- 🔐 **Encrypted API Keys** - Secure storage with AES-256 encryption

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Modern browser with WebGPU support (Chrome 113+, Firefox 110+)
- At least 4GB RAM (8GB+ recommended for larger models)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/local-gpt.git
cd local-gpt

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:5173` and start chatting with AI models that run entirely in your browser!

### Environment Variables (Optional)

```bash
# .env
VITE_ENCRYPTION_KEY=your-32-character-encryption-key-here
VITE_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
```

## 🏗️ How It Works

### Local AI Processing
- **WebLLM**: Uses WebAssembly and WebGPU for running LLM models in browser
- **Model Storage**: Models are cached in IndexedDB after first download
- **Streaming**: Real-time response generation with token streaming
- **Memory Management**: Automatic cleanup and optimization for performance

### Data Storage
- **IndexedDB**: All conversations and settings stored locally
- **Dexie.js**: Modern wrapper for IndexedDB with TypeScript support
- **Encryption**: API keys encrypted with Web Crypto API (AES-GCM 256-bit)
- **No Tracking**: Zero telemetry, analytics, or data collection

### Backend Services (Appwrite)
For optional cloud features, we use [Appwrite](https://appwrite.io/) as our backend-as-a-service:

- **User Authentication** - Secure user accounts and sessions
- **Cloud Sync** - Sync conversations across devices (opt-in)
- **Share Links** - Public conversation sharing with access control
- **NFT Minting** - Blockchain integration for conversation ownership
- **File Storage** - Secure cloud storage for uploaded files
- **Real-time Updates** - Live collaboration features

All cloud features are **optional** - the app works fully offline without any backend.

### Model Support
- **Text Models**: GPT-style models from 135M to 70B parameters
- **Vision Models**: Multimodal models that can analyze images
- **Code Models**: Specialized models for programming tasks
- **Math Models**: Models optimized for mathematical reasoning
- **Embedding Models**: For semantic search and similarity

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + N` | New chat |
| `Alt + B` | Toggle sidebar |
| `Alt + J` | Search conversations |
| `Alt + P` | Pin current chat |
| `Alt + S` | Share conversation |
| `Alt + R` | Rename chat |
| `Alt + Delete` | Delete chat |
| `?` | Show all shortcuts |
| `Enter` | Send message |
| `Shift + Enter` | New line |

## 🛠️ Tech Stack

### Frontend
- **[Vite](https://vitejs.dev/)** - Lightning fast build tool
- **[React 18](https://reactjs.org/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and better DX
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible primitives

### AI & Storage
- **[@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm)** - Local LLM inference
- **[Dexie.js](https://dexie.org/)** - IndexedDB wrapper
- **[React Router](https://reactrouter.com/)** - Client-side routing

### Backend (Optional)
- **[Appwrite](https://appwrite.io/)** - Open source backend server
- **[Docker](https://www.docker.com/)** - Containerized deployment
- **[PostgreSQL](https://www.postgresql.org/)** - Database for cloud features

### Development
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Vitest](https://vitest.dev/)** - Unit testing
- **[Playwright](https://playwright.dev/)** - E2E testing

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Base UI components (Shadcn/ui)
│   ├── chat/           # Chat-specific components
│   ├── dialogs/        # Modal dialogs
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── db.ts          # IndexedDB schema and operations
│   ├── encryption.ts  # Crypto utilities
│   └── utils.ts       # Helper functions
├── pages/              # Route components
├── providers/          # React context providers
├── types/              # TypeScript type definitions
└── worker.ts           # WebLLM worker thread
```

### Key Architecture Decisions

**Custom URL Parsing**: We use pathname parsing instead of React Router params for better control:
```typescript
// ❌ Traditional approach
const { conversationId } = useParams<{ conversationId: string }>();

// ✅ Our approach
const conversationId = useConversationId(); // Parses window.location.pathname
```

**Component Composition**: Following single responsibility principle:
- Each component has one clear purpose
- Composition over inheritance
- Custom hooks for business logic
- Container/presentational pattern

## 🤝 Contributing

We love contributions! Here's how you can help make Local-GPT better:

### 🐛 Bug Reports

Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Browser and OS information
- Console logs (if applicable)

### 💡 Feature Requests

Have an idea? Open an issue with:
- Detailed description of the feature
- Use case and benefits
- Possible implementation approach

### 🔧 Development

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Run the test suite**: `pnpm test`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to your branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### 📋 Coding Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Testing**: Unit tests for utilities, integration tests for components
- **Documentation**: JSDoc comments for public APIs

### 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

## 🚀 Deployment

### Static Hosting
Deploy to any static hosting service:

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

Recommended platforms:
- **[Vercel](https://vercel.com/)** - Zero-config deployment
- **[Netlify](https://netlify.com/)** - JAMstack platform
- **[GitHub Pages](https://pages.github.com/)** - Free hosting for public repos

### Self-Hosting with Appwrite

For full-featured deployment with backend:

```bash
# Clone and setup Appwrite
git clone https://github.com/appwrite/appwrite.git
cd appwrite
docker-compose up -d

# Configure your Local-GPT instance
# Update .env with your Appwrite endpoint and project ID
```

## 📊 Performance

### Recommended Hardware
- **Minimum**: 4GB RAM, integrated graphics
- **Recommended**: 8GB+ RAM, dedicated GPU
- **Optimal**: 16GB+ RAM, RTX 3060 or better

### Model Performance Guide
- **Ultra Light (0.5-1GB)**: Works on mobile devices
- **Light (1-3GB)**: Good for laptops and tablets
- **Medium (3-6GB)**: Requires decent hardware
- **Large (6-10GB)**: High-end devices only
- **Heavy (8-16GB)**: Workstation-class hardware
- **Extreme (16GB+)**: Server or high-end gaming PCs

## 🔐 Security

- **Local Processing**: All AI inference happens locally
- **Encrypted Storage**: API keys encrypted with AES-256-GCM
- **No Telemetry**: Zero tracking or analytics
- **Open Source**: Full transparency, audit the code yourself
- **CSP Headers**: Content Security Policy for XSS protection
- **Secure Headers**: HSTS, X-Frame-Options, etc.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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