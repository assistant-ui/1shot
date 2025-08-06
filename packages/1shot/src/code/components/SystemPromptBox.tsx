import React from "react";
import { Box, Text } from "ink";
import { useTerminalSize } from "../hooks/useTerminalSize";
// import { useThread } from "@assistant-ui/react-core";

interface SystemPromptBoxProps {
  summary?: string | undefined;
  description?: string;
}

export const SystemPromptBox: React.FC<SystemPromptBoxProps> = ({ 
  summary,
  // description = "This assistant helps with coding tasks, debugging, and development workflows. It can analyze code, suggest improvements, and generate solutions based on your requirements."
}) => {
  const { columns } = useTerminalSize();

  return (
    <Box 
      borderStyle="round" 
      borderColor="blue" 
      paddingX={1} 
      paddingY={0}
      marginTop={0}
      flexDirection="column"
      width={columns}
    >
      <Box marginBottom={1}>
        <Text bold color="blue">
          🎯 1Shot Prompt
        </Text>
      </Box>
      
      {summary && (
        <Box marginBottom={1}>
          <Text color="cyan" wrap="wrap">
            {summary}
          </Text>
        </Box>
      )}
      
      <Box>
        {/* <Text color="cyan" wrap="wrap">
          {description}
        </Text> */}
      </Box>
    </Box>
  );
}; 