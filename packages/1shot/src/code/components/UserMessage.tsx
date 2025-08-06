import React from "react";
import { Box, Text } from "ink";
import { MessagePrimitiveParts, usePart } from "@assistant-ui/react-core";

const TextPart = () => {
  const text = usePart((m) => {
    if (m.type !== "text") return "";
    return m.text;
  });
  return (
    <Box marginBottom={1}>
      <Text dimColor>&gt; {text}</Text>
    </Box>
  );
};

export const UserMessage: React.FC = () => {
  return <MessagePrimitiveParts components={{ Text: TextPart }} />;
};
