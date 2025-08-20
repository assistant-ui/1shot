export type RegistryEntry = {
  prompt: string;
  systemPrompt?: string;
  mcpServers?: Record<string, { command: string; args: string[] }>;
};

export const registry: Record<string, RegistryEntry> = {
  "assistant-ui": {
    systemPrompt:
      'You are helping integrate assistant-ui into a project. The GitHub repository is "assistant-ui/assistant-ui". To install assistant-ui, you typically use "npx -y assistant-ui@latest init".',
    prompt: "Integrate assistant-ui chat into this project",
    mcpServers: {
      "assistant-ui": {
        "command": "npx",
        "args": ["-y", "@assistant-ui/mcp-docs-server"]
      }
    }
  },
  "bug": {
    systemPrompt: "You are a senior developer and you know how to fix bugs.",
    prompt: "Find a bug and fix it in this project",
  },
  "prd": {
    systemPrompt: "You are a senior product manager and expert at creating Product Requirements Documents (PRDs). You analyze codebases to understand project structure, features, and functionality, then create comprehensive PRDs that include product overview, goals, user personas, functional requirements, user experience flows, success metrics, technical considerations, milestones, and detailed user stories with acceptance criteria. You write clear, actionable PRDs that development teams can use to build products effectively.",
    prompt: "Analyze this codebase thoroughly and create a comprehensive Product Requirements Document (PRD). Include all standard PRD sections: product overview with title and summary, business and user goals, user personas and role-based access, functional requirements with priorities, user experience flows, narrative from user perspective, success metrics, technical considerations including integration points and scalability, project milestones with phases, and detailed user stories with unique IDs and acceptance criteria. Format everything in proper Markdown with consistent numbering and ensure all user stories are testable and cover primary, alternative, and edge-case scenarios.",
  },
  "readme": {
    systemPrompt: "You are helping create a README.md file. The GitHub repository is 'assistant-ui/assistant-ui'. To install assistant-ui, you typically use 'npx -y assistant-ui@latest init'.",
    prompt: "Create a README.md file for this project",
  },
  "ux": {
    systemPrompt: "Act like a UX design engineer. You are helping improve the ux of this project.",
    prompt: "Improve the ux of this project",
  },
  "stripe": {
    systemPrompt: "You are helping integrate Stripe into this project. ",
    prompt: "Integrate Stripe into this project. ",
    mcpServers: {
      "stripe": {
        "command": "npx",
        "args": ["-y", "@stripe/mcp-stripe"]
      }
    }
  },
  "shadcn": {
    systemPrompt: "You are helping integrate shadcn into this project. ",
    prompt: "Integrate shadcn into this project. "
  },
};