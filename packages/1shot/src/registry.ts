export type RegistryEntry = {
  prompt: string;
  systemPrompt?: string;
  mcpServers?: Record<string, { command: string; args: string[] }>;
};

// Registry entries - please keep sorted alphabetically by key name
export const registry: Record<string, RegistryEntry> = {
  "assistant-ui": {
    systemPrompt:
      'You are helping integrate assistant-ui into a project. Use Deepwiki to understand installation steps. The GitHub repository is "assistant-ui/assistant-ui". To install assistant-ui, you typically use "npx -y assistant-ui@latest init".',
    prompt: "Integrate assistant-ui into this project",
    mcpServers: {
      "assistant-ui": {
        "command": "npx",
        "args": ["-y", "@assistant-ui/mcp-docs-server"]
      }
    }
  },
  
};