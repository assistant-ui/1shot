# 1shot

**One command, infinite possibilities.**

A powerful AI-powered CLI tool that executes complex development tasks with a single command. Built on top of `assistant-code` and designed for maximum developer productivity.

## 🚀 Quick Start

```bash
# Install globally
npm install -g 1shot

# Set up your API key
export ANTHROPIC_API_KEY="your-api-key"

# Run a command
npx 1shot readme
```

## ✨ Features

- 🎯 **One-shot execution** - Complex tasks completed with a single command
- 🤖 **Pre-configured AI assistants** - Purpose-built for common development workflows
- 📋 **Interactive command selector** - Browse and select from available commands
- 🔄 **Git-aware** - Warns about uncommitted changes before execution
- ⏸️ **ESC to pause** - Interrupt execution safely at any time
- 🎨 **Beautiful CLI** - Built with Ink and React for an exceptional terminal experience
- 📊 **Task summaries** - Clear completion reports for every execution

## 📦 Available Commands

| Command | Description |
|---------|-------------|
| `assistant-ui` | Integrate assistant-ui into your project |
| `bug` | Find and fix bugs in your codebase |
| `fix-next-build` | Resolve Next.js build issues |
| `readme` | Generate comprehensive README files |
| `prd` | Create Product Requirements Documents with JTBD, RICE, and MoSCoW methodologies |
| `frenchify` | Translate project summaries to French |
| `upgrade-next` | Upgrade to the latest version of Next.js |
| `upgrade-react` | Upgrade to the latest version of React |
| `upgrade-typescript` | Upgrade to the latest version of TypeScript |
| `hello-world` | Simple greeting command for testing |

## 🛠️ Usage

### Basic Usage
```bash
# Run a specific command
npx 1shot <command-name>

# Run with custom instructions
npx 1shot <command-name> "custom instructions here"

# Interactive mode - browse available commands
npx 1shot
```

### Examples
```bash
# Generate a README for your project
npx 1shot readme

# Fix build issues with custom context
npx 1shot fix-next-build "Focus on TypeScript errors"

# Create a comprehensive PRD
npx 1shot prd "Build a task management app"
```

## ⚙️ Setup

### Prerequisites
- Node.js (with ESM support)
- Anthropic API key

### API Key Configuration
Set your API key using one of these environment variables:
```bash
export ANTHROPIC_API_KEY="your-api-key"
# or
export ASSISTANT_CODE_API_KEY="your-api-key"
```

### Installation
```bash
# Global installation (recommended)
npm install -g 1shot

# Or run without installing
npx 1shot
```

## 🏗️ Architecture

This is a monorepo built with modern tooling:

```
1shot/
├── packages/
│   ├── 1shot/              # Main CLI tool
│   ├── landing/            # Next.js landing page
│   ├── assistant-ui-react-core/ # Core React components
│   └── tap/                # Additional utilities
├── pnpm-workspace.yaml     # Workspace configuration
└── turbo.json             # Build orchestration
```

### Tech Stack
- **TypeScript** - Type-safe development
- **Node.js ESM** - Modern JavaScript modules
- **Vite** - Fast build tooling
- **Ink + React** - Beautiful terminal UIs
- **pnpm** - Efficient package management
- **Turbo** - Monorepo build system

## 🔧 Development

### Setup
```bash
# Clone the repository
git clone https://github.com/assistant-ui/1shot.git
cd 1shot

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development mode
pnpm dev
```

### Adding New Commands
1. Edit `packages/1shot/src/registry.ts`
2. Add your command with system prompt and user prompt
3. Build and test: `pnpm build && npx 1shot your-command`

### Project Structure
- **Commands** are defined in `registry.ts` with system and user prompts
- **CLI interface** is built with Ink and React components
- **Build system** uses Vite for fast compilation
- **Versioning** managed with Changeset

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-command`
3. **Add your command** to the registry
4. **Test thoroughly**: `pnpm build && npx 1shot your-command`
5. **Submit a pull request**

### Command Guidelines
- Commands should solve common development tasks
- Include clear, specific system prompts
- Test with various project types
- Follow existing naming conventions

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [Landing Page](https://1shot.dev)
- [Command Registry](https://1shot.dev/registry)
- [GitHub Repository](https://github.com/assistant-ui/1shot)
- [Assistant UI](https://github.com/assistant-ui/assistant-ui)

---

**Made with ❤️ by the Assistant UI team**