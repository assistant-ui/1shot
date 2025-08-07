import React from "react";
import { Box, Text } from "ink";
import { useTerminalSize } from "../hooks/useTerminalSize";

interface SystemPromptBoxProps {
  summary?: string | undefined;
}

export const SystemPromptBox: React.FC<SystemPromptBoxProps> = ({ 
  summary
}) => {
  const { columns } = useTerminalSize();

  return (
    <Box 
      borderStyle="round" 
      borderColor="blue" 
      paddingX={2} 
      paddingY={1}
      marginTop={1}
      marginBottom={1}
      flexDirection="column"
      width={columns}
    >
      <Box marginBottom={1}>
        <Text bold color="blue">
          🎯 1Shot Command Center
        </Text>
      </Box>
      
      {summary && (
        <Box marginBottom={1} marginTop={1}>
          <Text color="cyan" wrap="wrap">
            {summary}
          </Text>
        </Box>
      )}
    </Box>
  );
}; 