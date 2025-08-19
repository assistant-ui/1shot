# 🎯 1shot

> 🤖 AI-powered CLI tool for instant task automation with Claude

[![Version](https://img.shields.io/npm/v/1shot.svg)](https://www.npmjs.com/package/1shot)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📖 Overview

1shot is a revolutionary command-line tool that transforms complex development tasks into single commands. Built on Claude AI and the robust `@anthropic-ai/claude-code` foundation, it enables developers to complete hours of work in minutes through intelligent automation.

The framework includes a powerful assistant UI system with Model Context Protocol (MCP) support, enabling sophisticated tool interactions, permission management, and real-time progress tracking.

## ✨ Features

- 🚀 **Single-command execution** - Complete complex tasks instantly
- 🤖 **AI-powered automation** - Leverages Claude for intelligent task completion
- 📝 **Smart documentation** - Generate comprehensive READMEs and docs
- 🔧 **Build error fixing** - Automatically resolve TypeScript and build issues
- 📦 **Dependency management** - Upgrade packages with breaking change handling
- 🎯 **Interactive selector** - Beautiful terminal UI for command discovery
- 🔄 **Git-aware** - Protects uncommitted changes and tracks modifications
- ⚡ **Real-time streaming** - Watch AI work with live progress updates

## 📦 Installation

```bash
# Install globally
npm install -g 1shot

# Or use directly with npx
npx 1shot
```

## 🚀 Quick Start

1. **Set up your API key:**
```bash
export ANTHROPIC_API_KEY=your-api-key-here
```

2. **Run your first command:**
```bash
# Launch interactive command selector
1shot

# Or run a specific command
1shot readme
```

## 📋 Available Commands

### 📝 Documentation
- `readme` - Generate comprehensive README
- `contributing` - Create CONTRIBUTING.md guide
- `api-docs` - Generate API documentation

### 🛠️ Development
- `fix-build` - Fix TypeScript/build errors
- `upgrade-deps` - Upgrade dependencies safely
- `add-tests` - Generate test suites
- `setup-ci` - Configure CI/CD pipelines

### ✅ Code Quality
- `add-eslint` - Set up ESLint configuration
- `format-code` - Apply consistent formatting
- `add-types` - Add TypeScript definitions

## 🎮 Interactive Mode

Launch without arguments to enter the interactive command selector:

```bash
1shot
```

Navigate with:
- ↑↓ - Move selection
- / - Search commands
- Enter - Execute command
- ESC - Cancel

## ⚙️ Configuration

Create a `.1shot` config file in your project:

```json
{
  "defaultCommands": ["readme", "fix-build"],
  "gitCheck": true,
  "autoCommit": false
}
```

## 🔧 Development

This is a monorepo managed with pnpm and Turbo:

```bash
# Install dependencies
pnpm install

# Run development mode
pnpm dev

# Build all packages
pnpm build
```

### 📁 Project Structure

```
1shot/
├── packages/
│   ├── 1shot/              # Main CLI package
│   ├── assistant-ui-react-core/  # Core UI components
│   └── x-buildutils/        # Build utilities
├── package.json
└── turbo.json
```

## 📋 Requirements

- Node.js 18+
- Git (for repository awareness)
- Anthropic API key

## 🔑 API Key

Get your Anthropic API key from [console.anthropic.com](https://console.anthropic.com) and set it as an environment variable:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © 1shot Contributors

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/your-org/1shot/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/1shot/discussions)
- **Documentation:** [Full Documentation](https://docs.1shot.dev)

---

🏗️ Built with ❤️ using Claude AI and React