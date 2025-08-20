# 1shot

A powerful AI-powered CLI tool that executes predefined commands with a single shot. Built on top of `assistant-code`, 1shot provides a collection of ready-to-use AI assistants for common development tasks.

## Features

- 🎯 **One-command execution**: Run complex tasks with a single command
- 🤖 **Pre-configured AI assistants**: Various specialized assistants for different tasks
- 📋 **Interactive command selector**: Browse and select commands interactively
- 🔄 **Git-aware**: Warns about uncommitted changes before execution
- ⏸️ **Pause functionality**: Press ESC to pause execution during tasks
- 🎨 **Beautiful CLI interface**: Built with Ink and React
- 📊 **Task completion summary**: Shows execution details and stats after completion

## Installation

```bash
npm install -g 1shot
```

## Setup

You need an Anthropic API key to use 1shot:

```bash
export ANTHROPIC_API_KEY=your-api-key
# or
export ASSISTANT_CODE_API_KEY=your-api-key
```

Get your API key from: https://claude.ai/settings/keys

## Usage

### Basic Usage

```bash
# Run a specific command
1shot <command-name>

# Run a command with custom prompt
1shot <command-name> "your custom request"

# Interactive command selector
1shot commands
```

### Available Commands

- **assistant-ui** - Integrate assistant-ui into your project 🤖
- **bug** - Find and fix bugs in your project 🐛
- **fix-next-build** - Fix Next.js build issues 🔧
- **frenchify** - Translate project summary to French 🇫🇷
- **hello-world** - Simple greeting command 👋
- **prd** - Create a comprehensive Product Requirements Document 📋
- **readme** - Create a README.md file for your project 📄
- **upgrade-next** - Upgrade to latest Next.js ⚡
- **upgrade-react** - Upgrade to latest React ⚛️
- **upgrade-typescript** - Upgrade to latest TypeScript 💙

### Examples

```bash
# Create a README for your project
1shot readme

# Find and fix bugs in your codebase
1shot bug

# Create a comprehensive PRD with best practices
1shot prd

# Use custom prompt with any command
1shot prd "Add user personas and an API section."

# Interactive mode - browse and select commands
1shot commands
```

## Git Integration

1shot checks your git status before executing commands and will warn you if:
- You're not in a git repository
- You have uncommitted changes
- You have untracked files

You can choose to continue anyway or cancel to commit your changes first.

## Pause and Resume

During command execution, you can:
- Press **ESC** once to see a pause warning
- Press **ESC** again within 3 seconds to pause execution
- Press any key to resume when paused
- Press **Ctrl+C** to cancel completely

## Development

### Project Structure

```
1shot/
├── src/
│   ├── index.ts        # Main CLI entry point
│   ├── registry.ts     # Command registry
│   └── components/     # React components (if any)
├── dist/               # Compiled output
├── package.json
├── build.mts           # Build configuration
└── README.md
```

### Prerequisites

- Node.js (with ESM support)
- npm or yarn
- TypeScript

### Building

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### Development Mode

```bash
# Run in watch mode
npm run dev
```

### Adding New Commands

To add a new command, edit `src/registry.ts`:

```typescript
export const registry: Record<string, RegistryEntry> = {
  "your-command": {
    systemPrompt: "System prompt for the AI assistant",
    prompt: "🎯 Default user prompt",
  },
  // ... other commands
};
```

Key points for new commands:
- Keep command names lowercase with hyphens
- Start prompts with an emoji for visual clarity
- System prompts should clearly define the assistant's role
- Consider using tools like Deepwiki for enhanced capabilities

## Dependencies

### Core Dependencies
- `@assistant-ui/react` - UI components for assistant interfaces
- `assistant-code` - Core AI assistant functionality
- `ink` - React renderer for CLI apps
- `cross-spawn` - Cross-platform command execution
- `vite` - Build tool

### Development Dependencies
- TypeScript
- Vite plugins
- Tailwind CSS (for any UI components)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Add your new commands in alphabetical order
- Include clear descriptions for system prompts
- Test your changes before submitting
- Update documentation if needed

## Troubleshooting

### API Key Issues
If you see "No API key found", ensure you've set:
```bash
export ANTHROPIC_API_KEY=your-api-key
```

### Command Not Found
If `1shot` command is not found after installation:
1. Ensure npm global bin is in your PATH
2. Try installing with `sudo` (on Unix systems)
3. Use `npx 1shot` as an alternative

### Build Errors
If you encounter build errors:
1. Ensure you're using a compatible Node.js version
2. Delete `node_modules` and reinstall
3. Check that all TypeScript types are properly installed

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built with ❤️ using:
- [Claude AI](https://claude.ai) by Anthropic
- [assistant-ui](https://github.com/assistant-ui/assistant-ui)
- [Ink](https://github.com/vadimdemedes/ink) by Vadim Demedes