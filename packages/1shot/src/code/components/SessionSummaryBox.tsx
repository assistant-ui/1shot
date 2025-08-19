import React from "react";
import { Box, Text } from "ink";
import { useThread } from "@assistant-ui/react-core";

interface SessionSummaryBoxProps {
  systemPrompt?: string | undefined;
}

export const SessionSummaryBox: React.FC<SessionSummaryBoxProps> = ({}) => {
  const messages = useThread((t) => t.messages);
  // Count messages by type
  const userMessages = messages.filter(msg => msg.role === "user");
  const assistantMessages = messages.filter(msg => msg.role === "assistant");
  
  // Get the first user message as the original prompt
  const firstUserMessage = userMessages[0];
  const originalPrompt = 
    firstUserMessage?.parts?.[0]?.type === "text" 
      ? firstUserMessage.parts[0].text 
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
      <Text bold color="green">✅ 1Shot Complete - {originalPrompt}</Text>
      <Text>Messages exchanged: {messages.length}</Text>
      <Text>User messages: {userMessages.length}</Text>
      <Text>Assistant responses: {assistantMessages.length}</Text>
      
      <Box marginTop={1} flexDirection="column">
        <Text bold color="cyan">What's next?</Text>
        <Text dimColor>• Type "/commands" for more commands</Text>
        <Text dimColor>• Continue the conversation</Text>
      </Box>
    </Box>
  );
}; 