import { query, SDKMessage, SDKUserMessage } from "@anthropic-ai/claude-code";
import { startMCPServer } from "./mcp/permissions-server";
import { createPermissionsStore } from "./mcp/permissions";

export interface AssistantCodeConfig {
  apiKey: string;
  systemPrompt?: string | undefined;
  mcpServers?: Record<string, { command: string; args: string[] }> | undefined;
}

const promiseWithResolvers = <T,>() => {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void = () => {};
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
};

export class AssistantCode {
  private _sessionId: string | null = null;
  private readonly _mcpPortPromise: Promise<number> | null = null;
  private readonly _resolveMcpPort: (port: number) => void;
  private readonly _rejectMcpPort: () => void;

  private _stopMCPServer: (() => Promise<void>) | null = null;
  public readonly permissionsStore: ReturnType<typeof createPermissionsStore>;

  // Message queue for continuous streaming
  private messageQueue: SDKUserMessage[] = [];
  private messageQueueResolvers: {
    resolve: (value: SDKUserMessage | null) => void;
    reject: (error: any) => void;
  }[] = [];
  private isStreamActive = false;
  private currentAbortController: AbortController | null = null;

  constructor(private readonly _options: AssistantCodeConfig) {
    this.permissionsStore = createPermissionsStore();
    const {
      promise: mcpPortPromise,
      resolve: resolveMcpPort,
      reject: rejectMcpPort,
    } = promiseWithResolvers<number>();
    this._mcpPortPromise = mcpPortPromise;
    this._resolveMcpPort = resolveMcpPort;
    this._rejectMcpPort = rejectMcpPort;
  }

  async start() {
    const { stop, portPromise } = startMCPServer(this.permissionsStore);
    this._stopMCPServer = stop;
    portPromise.then(this._resolveMcpPort).catch(this._rejectMcpPort);
  }

  private async *createMessageGenerator(): AsyncGenerator<SDKUserMessage> {
    while (true) {
      // Check if there are messages in the queue
      if (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()!;
        yield message;
      } else {
        // Wait for new messages
        const messagePromise = new Promise<SDKUserMessage | null>(
          (resolve, reject) => {
            this.messageQueueResolvers.push({ resolve, reject });
          }
        );

        const message = await messagePromise;
        if (message === null) {
          // Stream closed
          break;
        }
        yield message;
      }
    }
  }

  enqueueMessage(text: string) {
    const message: SDKUserMessage = {
      type: "user",
      message: {
        role: "user",
        content: text,
      },
      parent_tool_use_id: null,
      session_id: this._sessionId || "DUMMY_SESSION_ID",
    };

    // If there are waiting resolvers, resolve them immediately
    if (this.messageQueueResolvers.length > 0) {
      const resolver = this.messageQueueResolvers.shift()!;
      resolver.resolve(message);
    } else {
      // Otherwise, add to queue
      this.messageQueue.push(message);
    }
  }

  async *startStream(initialMessage?: string): AsyncGenerator<SDKMessage> {
    if (this.isStreamActive) {
      throw new Error("Stream is already active");
    }

    this.isStreamActive = true;
    this.currentAbortController = new AbortController();

    // Enqueue initial message if provided
    if (initialMessage) {
      this.enqueueMessage(initialMessage);
    }

    const messageGenerator = this.createMessageGenerator();

    try {
      for await (const message of query({
        prompt: messageGenerator,
        options: {
          ...(this._sessionId ? { resume: this._sessionId } : {}),
          abortController: this.currentAbortController,
          permissionMode: "acceptEdits",
          allowedTools: ["mcp__deepwiki", "mcp__assistant-ui", "Write", "Edit", "MultiEdit"],
          permissionPromptToolName: "mcp__permissions__approval_prompt",
          appendSystemPrompt: this._options.systemPrompt!,
          mcpServers: {
            ...(this._options.mcpServers || {}),
            permissions: {
              type: "http",
              url: `http://localhost:${await this
                ._mcpPortPromise}/mcp/permissions`,
            },
            deepwiki: {
              type: "http",
              url: "https://mcp.deepwiki.com/mcp",
            },
          },
        },
      })) {
        this._sessionId = message.session_id;
        yield message;
      }
    } finally {
      this.closeStream();
    }
  }

  closeStream() {
    this.isStreamActive = false;

    // Resolve all pending promises with null to signal stream end
    for (const resolver of this.messageQueueResolvers) {
      resolver.resolve(null);
    }
    this.messageQueueResolvers = [];
    this.messageQueue = [];
  }

  abortStream() {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
    this.closeStream();
  }


  async stop(): Promise<void> {
    this.abortStream();
    if (this._stopMCPServer) {
      await this._stopMCPServer();
    }
  }
}

export default AssistantCode;
