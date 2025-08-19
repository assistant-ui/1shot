import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { useTerminalSize } from "../hooks/useTerminalSize";
import { useThread } from "@assistant-ui/react-core";

interface SystemPromptBoxProps {
  summary?: string | undefined;
}

export const SystemPromptBox: React.FC<SystemPromptBoxProps> = ({ 
  summary
}) => {
  const { columns } = useTerminalSize();
  const isRunning = useThread((t) => t.isRunning);
  const [showTarget, setShowTarget] = useState(true);

  useEffect(() => {
    if (!isRunning) {
      setShowTarget(true); // Always show when not running
      return;
    }

    const interval = setInterval(() => {
      setShowTarget(prev => !prev);
    }, 1000); // Blink every 1s

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <Box 
      borderStyle="round" 
      borderColor="blue" 
      paddingX={2} 
      paddingY={1}
      marginBottom={1}
      flexDirection="column"
      width={columns}
    >
      <Box marginBottom={2}>
        <Text bold color="blue">
          ({showTarget ? '●' : ' '}) 1Shot Instructions
        </Text>
      </Box>
      
      {summary && (
        <Box>
          <Text color="cyan" wrap="wrap">
            {summary}
          </Text>
        </Box>
      )}
    </Box>
  );
}; 