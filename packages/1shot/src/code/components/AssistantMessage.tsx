import React, { useEffect } from "react";
import { Box, Text } from "ink";
import {
  MessagePrimitiveParts,
  useAssistantActions,
  useTextPart,
  useToolPart,
} from "@assistant-ui/react-core";
import { PermissionRequest } from "./PermissionRequest";
import { useProgress } from "../contexts/ProgressContext";

const AssistantPartContainer = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return (
    <Box marginBottom={1}>
      <Text>⏺</Text>
      <Box flexDirection="column">{children}</Box>
    </Box>
  );
};

export const ToolPartContainer = ({
  params,
  toolName,
  children,
}: {
  toolName?: string;
  params?: string | undefined;
  children?: React.ReactNode;
}) => {
  const part = useToolPart();
  const actions = useAssistantActions();
  const { addToolCall } = useProgress();

  // Track tool calls for progress display
  useEffect(() => {
    if (part.state === "output-available" || part.state === "output-error") {
      const displayName = toolName ?? part.type.substring(5);
      addToolCall(displayName);
    }
  }, [part.state, toolName, part.type, addToolCall]);

  if (part.state === "pending-approval") {
    return (
      <PermissionRequest
        tool_name={part.type.substring(5)}
        input={part.input}
        onApprove={() => {
          actions.thread.dispatch([
            {
              type: "add-tool-approval",
              toolCallId: part.toolCallId,
              decision: "approve",
            },
          ]);
        }}
        onDeny={() => {
          actions.thread.dispatch([
            {
              type: "add-tool-approval",
              toolCallId: part.toolCallId,
              decision: "reject",
            },
          ]);
        }}
      />
    );
  }

  return (
    <AssistantPartContainer>
      <Text>
        <Text bold>{toolName ?? part.type.substring(5)}</Text>
        {params && `(${params})`}
      </Text>
      {children}
    </AssistantPartContainer>
  );
};

const TextPart = () => {
  const text = useTextPart((p) => p.text);
  return (
    <AssistantPartContainer>
      <Text wrap="wrap">{text}</Text>
    </AssistantPartContainer>
  );
};

const ToolFallbackPart = () => {
  return (
    <ToolPartContainer>
      {/* <Text>{JSON.stringify(part)}</Text> */}
    </ToolPartContainer>
  );
};

export const AssistantMessage: React.FC = () => {
  return (
    <MessagePrimitiveParts
      components={{ Text: TextPart, ToolFallback: ToolFallbackPart }}
    />
  );
};
