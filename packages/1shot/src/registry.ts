export type RegistryEntry = {
  prompt: string;
  systemPrompt?: string;
  mcpServers?: Record<string, { command: string; args: string[] }>;
};

export const registry: Record<string, RegistryEntry> = {
  "assistant-ui": {
    systemPrompt:
      'You are helping integrate assistant-ui into a project. Use Deepwiki to understand installation steps. The GitHub repository is "assistant-ui/assistant-ui". To install assistant-ui, you typically use "npx -y assistant-ui@latest init".',
    prompt: "Integrate assistant-ui chat into this project",
    mcpServers: {
      "assistant-ui": {
        "command": "npx",
        "args": ["-y", "@assistant-ui/mcp-docs-server"]
      }
    }
  },
  "readme": {
    systemPrompt: "You are helping create a README.md file. Use Deepwiki to understand how to create a README.md file. The GitHub repository is 'assistant-ui/assistant-ui'. To install assistant-ui, you typically use 'npx -y assistant-ui@latest init'.",
    prompt: "Create a README.md file for this project",
  },
  "ux": {
    systemPrompt: "Act like a UX design engineer. You are helping improve the ux of this project.",
    prompt: "Improve the ux of this project",
  }
   
};