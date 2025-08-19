import React from "react";
import { SDKMessage } from "@anthropic-ai/claude-code";
import {
  AssistantProvider,
  backendTool,
  createConverter,
  BaseThread,
  FileSystemDebugSink,
  UIMessageLike,
  UIMessagePartLike,
  UICommand,
  Toolkit,
  useAssistantClient,
} from "@assistant-ui/react-core";
import AssistantCode, { AssistantCodeConfig } from "./AssistantCode";
import { PermissionRequest } from "./mcp/permissions";
import { ToolPartContainer } from "./components/AssistantMessage";
import { relative } from "path";
import { Text } from "ink";
import {
  resource,
  tapEffect,
  tapMemo,
  tapResource,
  tapState,
} from "@assistant-ui/tap";
import { highlightCodeWithStrings } from "./utils/syntaxHighlight";
import { StoreApi } from "zustand";
import { useProgress } from "./contexts/ProgressContext";

type AssistantCodeThreadConfig = {
  config: AssistantCodeConfig;
};

type ChatMessageState = {
  messages: readonly SDKMessage[];
  pendingApprovals: readonly PermissionRequest[];
};

const ChatMessageConverter = createConverter<ChatMessageState>(
  ({ state, metadata }, context) => {
    const messages = context.memoizeMap(
      state.messages,
      (message): UIMessageLike | UIMessageLike[] => {
        if (message.type !== "user" && message.type !== "assistant") {
          return [];
        }

        const parts =
          typeof message.message.content === "string"
            ? [{ type: "text" as const, text: message.message.content }]
            : message.message.content;

        return {
          role: message.type,
          parts: parts
            .map((p): UIMessagePartLike | undefined => {
              switch (p.type) {
                case "text":
                  return { type: "text", text: p.text };
                case "thinking":
                  return { type: "text", text: p.thinking };
                case "tool_use":
                  return {
                    type: `tool-${p.name}`,
                    toolCallId: p.id,
                    input: p.input,
                  };

                case "tool_result":
                  const content =
                    typeof p.content === "string"
                      ? p.content
                      : p.content
                          ?.filter((c) => c.type === "text")
                          .map((c) => c.text)
                          .join("\n");

                  return {
                    type: `toolOutput`,
                    toolCallId: p.tool_use_id,
                    output: p.is_error ? undefined : content,
                    errorText: p.is_error ? content : undefined,
                  };

                default:
                  return undefined;
              }
            })
            .filter((p) => p !== undefined),
        } satisfies UIMessageLike;
      }
    );

    const approvalMessages = state.pendingApprovals.map(
      (approval): UIMessageLike => {
        return {
          role: "assistant",
          parts: [
            {
              type: `tool-${approval.tool_name}`,
              toolCallId: approval.id,
              state: "pending-approval",
              input: approval.input,
            },
          ],
        };
      }
    );

    return {
      messages: context.fromUIMessageLikes([
        ...messages.flat(),
        ...approvalMessages,
      ]),
      isRunning: metadata.isSending,
      metadata: {
        usage: state.messages.reduce(
          (acc, message) => {
            if (message.type === "assistant") {
              acc.inputTokens += message.message.usage.input_tokens;
              acc.outputTokens += message.message.usage.output_tokens;
            }
            return acc;
          },
          { inputTokens: 0, outputTokens: 0 }
        ),
      },
    };
  }
);

export const tapZustandStore = <T,>(store: StoreApi<T>): T => {
  const [value, setValue] = tapState<T>(store.getState());
  tapEffect(() => {
    setValue(store.getState());
    return store.subscribe(() => {
      setValue(store.getState());
    });
  }, [store]);
  return value;
};

export const AssistantCodeThread = resource(
  (config: AssistantCodeThreadConfig) => {
    // Create core instances
    const [messages, setMessages] = tapState<SDKMessage[]>([]);
    const assistantCode = tapMemo(() => new AssistantCode(config.config), []);
    tapEffect(() => {
      assistantCode.start();
    }, [assistantCode]);

    tapEffect(() => {
      FileSystemDebugSink.writeToFile("assistant.debug.txt", messages);
    }, [messages]);

    // State management
    const [activeStreamIterator, setActiveStreamIterator] =
      tapState<AsyncIterator<SDKMessage> | null>(null);
    const [isFirstMessage, setIsFirstMessage] = tapState(true);
    const [isRunning, setIsRunning] = tapState(false);

    const permissionsState = tapZustandStore(assistantCode.permissionsStore);

    const converter = tapMemo(() => ChatMessageConverter.getStore(), []);
    const combinedState = tapMemo(
      () =>
        converter.convert({
          state: {
            messages,
            pendingApprovals: permissionsState.pendingRequests,
          },
          metadata: {
            isSending: isRunning,
          },
        }),
      [messages, permissionsState.pendingRequests, isRunning]
    );

    return tapResource(
      BaseThread({
        state: combinedState,
        onDispatch: async (commands: readonly UICommand[]) => {
          if (commands.length !== 1) throw new Error("Not implemented");
          const command = commands[0]!;
          if (command.type === "add-tool-approval") {
            assistantCode.permissionsStore
              .getState()
              .pendingRequests.forEach((r) => {
                if (r.id === command.toolCallId) {
                  if (command.decision === "approve") {
                    r.approve();
                  } else {
                    r.deny();
                  }
                }
              });

            return;
          }
          if (command.type === "cancel") {
            assistantCode.abortStream();
            setActiveStreamIterator(null);
            setIsFirstMessage(true);
            return;
          }

          if (command.type !== "add-message")
            throw new Error("Not implemented");
          const message = command.message;
          const text = message.parts.map((p) => p.text).join("");

          setMessages((messages) => [
            ...messages,
            {
              type: "user",
              message: {
                role: "user",
                content: text,
              },
              parent_tool_use_id: null,
              session_id: "DUMMY_SESSION_ID",
            },
          ]);
          setIsRunning(true);

          try {
            // If this is a subsequent message in an active stream, enqueue it
            if (activeStreamIterator && !isFirstMessage) {
              assistantCode.enqueueMessage(text);
              return;
            }

            // Otherwise, start a new stream
            setIsFirstMessage(false);
            const streamGenerator = assistantCode.startStream(text);
            const newIterator = streamGenerator[Symbol.asyncIterator]();
            setActiveStreamIterator(newIterator);

            // Process messages from the stream
            const processStream = async () => {
              try {
                while (true) {
                  const result = await newIterator.next();
                  if (result.done) {
                    break;
                  }
                  try {
                    setMessages((messages) => [...messages, result.value]);
                    setIsRunning(result.value.type !== "result");
                  } catch (error) {
                    // Don't log AbortErrors as they are expected when user cancels
                    if (!(error instanceof Error && error.name === 'AbortError')) {
                      console.error(error);
                    }
                  }
                }
                setIsRunning(false);
                setActiveStreamIterator(null);
                setIsFirstMessage(true);
              } catch (error) {
                // Don't log AbortErrors as they are expected when user cancels
                if (!(error instanceof Error && error.name === 'AbortError')) {
                  console.error(error);
                }
                setIsRunning(false);
                setActiveStreamIterator(null);
                setIsFirstMessage(true);
              }
            };

            // Start processing the stream
            processStream();
          } catch (error) {
            // Don't log AbortErrors as they are expected when user cancels
            if (!(error instanceof Error && error.name === 'AbortError')) {
              console.error(error);
            }
            setIsRunning(false);
          }
        },
      })
    );
  }
);

declare global {
  interface Assistant {
    UITools: {
      Write: {
        input: {
          file_path: string;
          content: string;
        };
        output: {};
      };
      mcp__permissions__Progress: {
        input: {
          title: string;
          percentageDone: number;
        };
        output: {};
      };
      mcp__deepwiki__read_wiki_structure: {
        input: {
          repoName: string;
        };
        output: string;
      };
      mcp__deepwiki__read_wiki_contents: {
        input: {
          repoName: string;
          path: string;
        };
        output: string;
      };
      mcp__deepwiki__ask_question: {
        input: {
          repoName: string;
          question: string;
        };
        output: string;
      };
      Read: {
        input: {
          file_path: string;
        };
        output: string;
      };
      TodoWrite: {
        input: {
          todos: {
            id: string;
            content: string;
            status: "in_progress" | "pending" | "completed";
            priority: "low" | "medium" | "high";
          }[];
        };
        output: string;
      };
      Bash: {
        input: {
          command: string;
          description?: string;
          timeout?: number;
        };
        output: string;
      };
      Edit: {
        input: {
          file_path: string;
          old_string: string;
          new_string: string;
          replace_all?: boolean;
        };
        output: {};
      };
      Glob: {
        input: {
          pattern: string;
          path?: string;
        };
        output: string;
      };
      Grep: {
        input: {
          pattern: string;
          path?: string;
          glob?: string;
          type?: string;
          output_mode?: "content" | "files_with_matches" | "count";
          "-A"?: number;
          "-B"?: number;
          "-C"?: number;
          "-i"?: boolean;
          "-n"?: boolean;
          multiline?: boolean;
          head_limit?: number;
        };
        output: string;
      };
      LS: {
        input: {
          path: string;
          ignore?: string[];
        };
        output: string;
      };
      MultiEdit: {
        input: {
          file_path: string;
          edits: {
            old_string: string;
            new_string: string;
            replace_all?: boolean;
          }[];
        };
        output: {};
      };
      NotebookEdit: {
        input: {
          notebook_path: string;
          new_source: string;
          cell_id?: string;
          cell_type?: "code" | "markdown";
          edit_mode?: "replace" | "insert" | "delete";
        };
        output: {};
      };
      NotebookRead: {
        input: {
          notebook_path: string;
          cell_id?: string;
        };
        output: string;
      };
      Task: {
        input: {
          description: string;
          prompt: string;
        };
        output: string;
      };
      WebFetch: {
        input: {
          url: string;
          prompt: string;
        };
        output: string;
      };
      WebSearch: {
        input: {
          query: string;
          allowed_domains?: string[];
          blocked_domains?: string[];
        };
        output: string;
      };
      ExitPlanMode: {
        input: {
          plan: string;
        };
        output: {};
      };
      mcp__ide__getDiagnostics: {
        input: {
          uri?: string;
        };
        output: string;
      };
      mcp__ide__executeCode: {
        input: {
          code: string;
        };
        output: string;
      };
    };
    ThreadMetadata: {
      usage: {
        inputTokens: number;
        outputTokens: number;
      };
    };
  }
}

const toolkit: Toolkit = {
  Write: backendTool({
    render: ({ state, input }) => {
      const { setSubtitle } = useProgress();
      
      React.useEffect(() => {
        if (state !== "input-streaming" && input?.file_path) {
          setSubtitle(`Writing: ${relative(process.cwd(), input.file_path)}`);
        }
      }, [state, input, setSubtitle]);
      
      return (
        <ToolPartContainer
          params={
            state === "input-streaming"
              ? undefined
              : relative(process.cwd(), input.file_path)
          }
        >
          {state !== "input-streaming" && input.content && (
            <>
              <Text>
                Wrote {input.content.split("\n").length} lines to{" "}
                {relative(process.cwd(), input.file_path)}
              </Text>
              <Text>
                {highlightCodeWithStrings(
                  input.content.split("\n").slice(0, 5).join("\n")
                )}
              </Text>
              {input.content.split("\n").length > 5 && (
                <Text dimColor>
                  ... +{input.content.split("\n").length - 5} lines (ctrl+r to
                  expand)
                </Text>
              )}
            </>
          )}
        </ToolPartContainer>
      );
    },
  }),
  mcp__permissions__Progress: backendTool({
    render: ({ input, output }) => {
      console.log("input", input);
      console.log("output", output);
      const { setProgress, setSubtitle } = useProgress();
      
      // Use useEffect with proper dependencies
      React.useEffect(() => {
        if (input?.title !== undefined && input?.percentageDone !== undefined) {
          setProgress(input.title, input.percentageDone);
          setSubtitle(undefined);
        }
      }, [input?.title, input?.percentageDone]); // Only depend on the actual values, not the functions
      
      // Display in the message thread
      return (
        <ToolPartContainer toolName="Progress Update">
          <Text color="cyan">
            📊 {input?.title || 'Progress'} - {input?.percentageDone || 0}%
          </Text>
        </ToolPartContainer>
      );
    },
  }),
  mcp__deepwiki__read_wiki_structure: backendTool({
    render: ({ input, output }) => {
      return (
        <ToolPartContainer
          toolName="DeepWiki:ReadWikiStructure"
          params={input.repoName}
        >
          <Text>{output?.split("\n").slice(0, 5).join("\n")}</Text>
        </ToolPartContainer>
      );
    },
  }),
  mcp__deepwiki__read_wiki_contents: backendTool({
    render: ({ input, output }) => {
      return (
        <ToolPartContainer
          toolName="DeepWiki:ReadWikiContents"
          params={`${input.repoName}:${input.path}`}
        >
          <Text>{output?.split("\n").slice(0, 5).join("\n")}</Text>
        </ToolPartContainer>
      );
    },
  }),
  mcp__deepwiki__ask_question: backendTool({
    render: ({ input, output }) => {
      return (
        <ToolPartContainer
          toolName="DeepWiki:AskQuestion"
          params={input.repoName}
        >
          <Text>Question: {input.question}</Text>
          <Text>Answer: {output?.split("\n").slice(0, 5).join("\n")}</Text>
        </ToolPartContainer>
      );
    },
  }),
  Read: backendTool({
    render: ({ input, output }) => {
      const { setSubtitle } = useProgress();
      
      React.useEffect(() => {
        if (input?.file_path) {
          setSubtitle(`Reading: ${relative(process.cwd(), input.file_path)}`);
        }
      }, [input, setSubtitle]);
      
      const lineCount = output ? output.split("\n").length : 0;
      return (
        <ToolPartContainer toolName="Read File" params={input.file_path}>
          {output && (
            <>
              <Text>Read {lineCount} lines</Text>
              {/* <Text dimColor>(ctrl+r to expand)</Text> */}
            </>
          )}
        </ToolPartContainer>
      );
    },
  }),
  TodoWrite: backendTool({
    render: ({ input }) => {
      return (
        <ToolPartContainer toolName="Update Todos">
          {input?.todos?.map((t) => (
            <Text
              key={t.id}
              color={
                t.status === "completed"
                  ? "green"
                  : t.status === "in_progress"
                  ? "blue"
                  : "white"
              }
              bold={t.status === "in_progress"}
            >
              {t.status === "completed" ? "☑" : "☐"}{" "}
              <Text
                strikethrough={t.status === "completed"}
                color={
                  t.status === "completed"
                    ? "green"
                    : t.status === "in_progress"
                    ? "blue"
                    : "white"
                }
              >
                {t.content}
              </Text>
            </Text>
          ))}
        </ToolPartContainer>
      );
    },
  }),
  Bash: backendTool({
    render: ({ state, input, output }) => {
      const { setSubtitle } = useProgress();
      
      React.useEffect(() => {
        if (state !== "input-streaming" && input?.command) {
          const cmd = input.command.length > 50 
            ? input.command.substring(0, 47) + '...'
            : input.command;
          setSubtitle(`Running: ${cmd}`);
        }
      }, [state, input, setSubtitle]);
      
      return (
        <ToolPartContainer
          toolName="Bash"
          params={
            state === "input-streaming"
              ? undefined
              : input.description || input.command
          }
        >
          {state !== "input-streaming" && (
            <>
              <Text>$ {input.command}</Text>
              {output && (
                <Text>{output.split("\n").slice(0, 10).join("\n")}</Text>
              )}
            </>
          )}
        </ToolPartContainer>
      );
    },
  }),
  Edit: backendTool({
    render: ({ state, input }) => {
      const { setSubtitle } = useProgress();
      
      React.useEffect(() => {
        if (state !== "input-streaming" && input?.file_path) {
          setSubtitle(`Editing: ${relative(process.cwd(), input.file_path)}`);
        }
      }, [state, input, setSubtitle]);
      
      return (
        <ToolPartContainer
          toolName="Edit"
          params={
            state === "input-streaming"
              ? undefined
              : relative(process.cwd(), input.file_path)
          }
        >
          {state !== "input-streaming" && input.new_string && (
            <>
              <Text>
                Edited {input.new_string.split("\n").length} lines in{" "}
                {relative(process.cwd(), input.file_path)}
              </Text>
              <Text>
                {highlightCodeWithStrings(
                  input.new_string.split("\n").slice(0, 5).join("\n")
                )}
              </Text>
              {input.new_string.split("\n").length > 5 && (
                <Text dimColor>
                  ... +{input.new_string.split("\n").length - 5} lines (ctrl+r
                  to expand)
                </Text>
              )}
            </>
          )}
        </ToolPartContainer>
      );
    },
  }),
  Glob: backendTool({
    render: ({ input, output }) => {
      return (
        <ToolPartContainer toolName="Glob" params={input.pattern}>
          {output && <Text>{output.split("\n").slice(0, 10).join("\n")}</Text>}
        </ToolPartContainer>
      );
    },
  }),
  Grep: backendTool({
    render: ({ input, output }) => {
      const { setSubtitle } = useProgress();
      
      React.useEffect(() => {
        if (input?.pattern) {
          const pattern = input.pattern.length > 30 
            ? input.pattern.substring(0, 27) + '...'
            : input.pattern;
          setSubtitle(`Searching: "${pattern}"`);
        }
      }, [input, setSubtitle]);
      
      return (
        <ToolPartContainer toolName="Grep" params={input.pattern}>
          {output && <Text>{output.split("\n").slice(0, 10).join("\n")}</Text>}
        </ToolPartContainer>
      );
    },
  }),
  LS: backendTool({
    render: ({ input, output }) => {
      const { setSubtitle } = useProgress();
      
      React.useEffect(() => {
        if (input?.path) {
          setSubtitle(`Listing: ${input.path || '.'}`);
        }
      }, [input, setSubtitle]);
      
      return (
        <ToolPartContainer toolName="LS" params={input.path}>
          {output && <Text>{output.split("\n").slice(0, 10).join("\n")}</Text>}
        </ToolPartContainer>
      );
    },
  }),
  MultiEdit: backendTool({
    render: ({ state, input }) => {
      return (
        <ToolPartContainer
          toolName="MultiEdit"
          params={
            state === "input-streaming"
              ? undefined
              : relative(process.cwd(), input.file_path)
          }
        >
          {state !== "input-streaming" && (
            <Text>{input.edits?.length} edits</Text>
          )}
        </ToolPartContainer>
      );
    },
  }),
  NotebookEdit: backendTool({
    render: ({ state, input }) => {
      return (
        <ToolPartContainer
          toolName="NotebookEdit"
          params={
            state === "input-streaming"
              ? undefined
              : input.notebook_path
              ? relative(process.cwd(), input.notebook_path)
              : ""
          }
        >
          {state !== "input-streaming" && (
            <Text>
              {input.edit_mode || "replace"} cell {input.cell_id || "(new)"}
            </Text>
          )}
        </ToolPartContainer>
      );
    },
  }),
  NotebookRead: backendTool({
    render: ({ input, output }) => {
      return (
        <ToolPartContainer
          toolName="NotebookRead"
          params={
            input.notebook_path
              ? relative(process.cwd(), input.notebook_path)
              : ""
          }
        >
          {output && <Text>{output.split("\n").slice(0, 5).join("\n")}</Text>}
        </ToolPartContainer>
      );
    },
  }),
  Task: backendTool({
    render: ({ input, output }) => {
      return (
        <ToolPartContainer toolName="Task" params={input.description}>
          <Text>{input.prompt?.split("\n").slice(0, 3).join("\n")}</Text>
          {output && (
            <Text>Result: {output.split("\n").slice(0, 5).join("\n")}</Text>
          )}
        </ToolPartContainer>
      );
    },
  }),
  WebFetch: backendTool({
    render: ({ input, output }) => {
      return (
        <ToolPartContainer toolName="WebFetch" params={input.url}>
          <Text>{input.prompt || ""}</Text>
          {output && <Text>{output.split("\n").slice(0, 5).join("\n")}</Text>}
        </ToolPartContainer>
      );
    },
  }),
  WebSearch: backendTool({
    render: ({ input, output }) => {
      return (
        <ToolPartContainer toolName="WebSearch" params={input.query}>
          {output && <Text>{output.split("\n").slice(0, 10).join("\n")}</Text>}
        </ToolPartContainer>
      );
    },
  }),
  ExitPlanMode: backendTool({
    render: ({ input }) => {
      return (
        <ToolPartContainer toolName="Exit Plan Mode">
          <Text>{input.plan?.split("\n").slice(0, 5).join("\n") || ""}</Text>
        </ToolPartContainer>
      );
    },
  }),

  mcp__ide__getDiagnostics: backendTool({
    render: ({ input, output }) => {
      return (
        <ToolPartContainer
          toolName="IDE:GetDiagnostics"
          params={input.uri || "all files"}
        >
          {output && <Text>{output.split("\n").slice(0, 10).join("\n")}</Text>}
        </ToolPartContainer>
      );
    },
  }),
  mcp__ide__executeCode: backendTool({
    render: ({ input, output }) => {
      return (
        <ToolPartContainer toolName="IDE:ExecuteCode">
          <Text>{input.code?.split("\n").slice(0, 5).join("\n") || ""}</Text>
          {output && (
            <Text>Output: {output.split("\n").slice(0, 5).join("\n")}</Text>
          )}
        </ToolPartContainer>
      );
    },
  }),
  
};

export const ChatProvider = ({
  config,
  children,
}: {
  config: AssistantCodeConfig;
  children: React.ReactNode;
}) => {
  const client = useAssistantClient({
    thread: AssistantCodeThread({
      config,
    }),
    toolkit,
  });

  return <AssistantProvider client={client}>{children}</AssistantProvider>;
};
