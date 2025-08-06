import React from "react";
import { Box, Text } from "ink";
import { useThread } from "@assistant-ui/react-core";

interface SessionSummaryBoxProps {
  systemPrompt?: string | undefined;
}

export const SessionSummaryBox: React.FC<SessionSummaryBoxProps> = ({ systemPrompt }) => {
  const messages = useThread((t) => t.messages);
  const usage = useThread((t) => t.metadata.usage);
  const totalTokens = usage.inputTokens + usage.outputTokens;
  // Count messages by type
  const userMessages = messages.filter(msg => msg.role === "user");
  const assistantMessages = messages.filter(msg => msg.role === "assistant");
  
  // Get the first user message as the original prompt
  const originalPrompt = userMessages[0]?.parts[0]?.type === "text" 
    ? userMessages[0].parts[0].text 
    : "No prompt found";

  return (
    <Box 
      borderStyle="round" 
      borderColor="green" 
      paddingX={2} 
      paddingY={1}
      marginTop={1}
      flexDirection="column"
    >
      <Text bold color="green">✅ Session Complete - {originalPrompt}</Text>
      {systemPrompt && (
        <Text>System prompt: <Text dimColor>{systemPrompt}</Text></Text>
      )}
      <Text>Messages exchanged: <Text bold>{messages.length}</Text></Text>
      <Text>User messages: <Text bold>{userMessages.length}</Text></Text>
      <Text>Assistant responses: <Text bold>{assistantMessages.length}</Text></Text>
      
      <Text>Total tokens: <Text bold>{totalTokens}</Text></Text>
      <Text dimColor>🎉 Session finished successfully</Text>
    </Box>
  );
}; 