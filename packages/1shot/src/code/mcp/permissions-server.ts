// Hijack console output BEFORE importing FastMCP to catch all logs
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Also hijack process.stdout.write which FastMCP might be using directly
const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

const shouldFilter = (message: string) => {
  return (
    message.includes("[FastMCP info]") ||
    message.includes("[mcp-proxy]") ||
    message.includes("server is running on HTTP Stream") ||
    message.includes("Transport type: httpStream") ||
    message.includes("HTTP Stream session established") ||
    message.includes("establishing new SSE stream") ||
    message.includes("AbortError: Claude Code process aborted by user") ||
    message.includes("Claude Code process aborted") ||
    message.includes("process aborted by user") ||
    message.includes("AbortError") ||
    message.includes("The operation was aborted") ||
    message.includes("This operation was aborted") ||
    message.includes("npm warn Unknown project config") ||
    message.includes("link-workspace-packages") ||
    message.includes("prefer-workspace-packages") ||
    message.includes("This will stop working in the next major version of npm")
  );
};

console.log = (...args: any[]) => {
  const message = args.join(" ");
  if (!shouldFilter(message)) {
    originalConsoleLog(...args);
  }
};

console.info = (...args: any[]) => {
  const message = args.join(" ");
  if (!shouldFilter(message)) {
    originalConsoleInfo(...args);
  }
};

console.warn = (...args: any[]) => {
  const message = args.join(" ");
  if (!shouldFilter(message)) {
    originalConsoleWarn(...args);
  }
};

console.error = (...args: any[]) => {
  const message = args.join(" ");
  if (!shouldFilter(message)) {
    originalConsoleError(...args);
  }
};

// Hijack process.stdout.write
process.stdout.write = function (chunk: any, encoding?: any, callback?: any) {
  const message = chunk.toString();
  if (!shouldFilter(message)) {
    return originalStdoutWrite.call(this, chunk, encoding, callback);
  }
  return true;
};

// Hijack process.stderr.write
process.stderr.write = function (chunk: any, encoding?: any, callback?: any) {
  const message = chunk.toString();
  if (!shouldFilter(message)) {
    return originalStderrWrite.call(this, chunk, encoding, callback);
  }
  return true;
};

import { FastMCP } from "fastmcp";
import { z } from "zod";
import { createPermissionsStore } from "./permissions";
import { AddressInfo, createServer } from "net";

async function findAvailablePort() {
  return new Promise<number>((res) => {
    const server = createServer();
    server.listen(0, () => {
      const port = (server.address() as AddressInfo).port;
      server.close(() => res(port));
    });
  });
}

export const startMCPServer = (
  permissionsStore: ReturnType<typeof createPermissionsStore>
): {
  portPromise: Promise<number>;
  stop: () => Promise<void>;
} => {
  // Find an available port

  const server = new FastMCP({
    name: "1shot-permissions",
    version: "1.0.0",
  });

  server.addTool({
    name: "approval_prompt",
    description: "Request permission for a tool action from the user",
    parameters: z.object({
      tool_name: z.string().describe("The tool requesting permission"),
      input: z.object({}).passthrough().describe("The input for the tool"),
    }),
    execute: async ({ tool_name, input }) => {
      return new Promise((resolve) => {
        permissionsStore.getState().addRequest({
          tool_name,
          input,
          approve: () => {
            resolve({
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    behavior: "allow",
                    updatedInput: input,
                  }),
                },
              ],
            });
          },
          deny: () => {
            resolve({
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    behavior: "deny",
                    message: "Permission denied by user",
                  }),
                },
              ],
            });
          },
        });
      });
    },
  });

  server.addTool({
    name: "Progress",
    description: "Report progress on the current task. MUST be called first thing and at significant milestones: (1) At task start (0-10%), (2) When completing major phases or subtasks, (3) Before and after important operations like file creation, API calls, or installations, (4) At regular intervals during long operations, (5) At task completion (100%). This keeps users informed about what's happening in real-time.",
    parameters: z.object({
      title: z.string().describe("Brief, clear description of the current action or milestone (e.g., 'Analyzing project structure', 'Installing dependencies', 'Creating components')"),
      percentageDone: z.number().min(0).max(100).describe("Overall task completion percentage from 0 to 100"),
    }),
    execute: async ({ title, percentageDone }) => {
      // The actual progress update is handled by the UI components
      // This tool just acknowledges the progress update
      return {
        content: [
          {
            type: "text",
            text: `Progress updated: ${title} (${percentageDone}%)`,
          },
        ],
      };
    },
  });

  const portPromise = new Promise<number>(async (res) => {
    const port = await findAvailablePort();
    await server.start({
      transportType: "httpStream",
      httpStream: {
        endpoint: "/mcp/permissions",
        port: port,
      },
    });

    res(port);
  });

  return {
    stop: async () => {
      await portPromise;
      return server.stop();
    },
    portPromise,
  };
};
