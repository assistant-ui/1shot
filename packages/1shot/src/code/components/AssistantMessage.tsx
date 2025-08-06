import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import {
  MessagePrimitiveParts,
  useAssistantActions,
  usePart,
  useTextPart,
  useToolPart,
} from "@assistant-ui/react-core";
import { PermissionRequest } from "./PermissionRequest";

const BlinkingText = ({ children }: { children: React.ReactNode }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <Text color={isBlinking ? "black" : "blackBright"}>{children}</Text>;
};

const AssistantPartIndicator = () => {
  const status = usePart((p) => {
    if (p.type === "text") return "neutral";
    if (p.state === "output-available") return "success";
    if (p.state === "output-error") return "error";
    return "in_progress";
  });

  if (status === "neutral") return <Text>⏺</Text>;
  if (status === "in_progress") return <BlinkingText>⏺</BlinkingText>;
  return <Text color={status === "success" ? "green" : "red"}>⏺</Text>;
};

const AssistantPartContainer = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return (
    <Box marginBottom={1}>
      <AssistantPartIndicator />
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

  if (part.state === "pending-approval") {
    return (
      <PermissionRequest
        tool_name={part.type.substring(5)}
        input={part.input}
        onApprove={() => {
          actions.thread.send([
            {
              type: "add-tool-approval",
              toolCallId: part.toolCallId,
              decision: "approve",
            },
          ]);
        }}
        onDeny={() => {
          actions.thread.send([
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
