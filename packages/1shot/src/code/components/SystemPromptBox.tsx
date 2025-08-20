import React from "react";
import { Box, Text } from "ink";
import { useTerminalSize } from "../hooks/useTerminalSize";

interface SystemPromptBoxProps {
  summary?: string | undefined;
  mcpServers?: Record<string, { command: string; args: string[] }> | undefined;
}

export const SystemPromptBox: React.FC<SystemPromptBoxProps> = ({ 
  summary,
  mcpServers,
}) => {
  const { columns } = useTerminalSize();
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
          (●) 1Shot Instructions
        </Text>
      </Box>
      
      {summary && (
        <Box>
          <Text color="cyan" wrap="wrap">
            {summary}
          </Text>
        </Box>
      )}
      {mcpServers && Object.keys(mcpServers).length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="yellow" bold>
            MCP Servers:
          </Text>
          {Object.entries(mcpServers).map(([name, config]) => (
            <Box key={name} marginLeft={2}>
              <Text color="cyan">
                • {name}: {config.command} {config.args.join(' ')}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}; 