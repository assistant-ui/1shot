import React, { useState, useMemo } from "react";
import { Box, Text, useInput } from "ink";

export interface RegistryEntry {
  prompt: string;
  systemPrompt?: string;
}

export interface CommandSelectorProps {
  registry: Record<string, RegistryEntry>;
  onSelect: (key: string, entry: RegistryEntry) => void;
  onCancel: () => void;
}

export const CommandSelector: React.FC<CommandSelectorProps> = ({
  registry,
  onSelect,
  onCancel,
}) => {
  const commands = useMemo(() => 
    Object.entries(registry).sort(([a], [b]) => a.localeCompare(b)),
    [registry]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((_, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev === 0 ? commands.length - 1 : prev - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => (prev === commands.length - 1 ? 0 : prev + 1));
      return;
    }

    if (key.return) {
      const command = commands[selectedIndex];
      if (command) {
        const [commandKey, entry] = command;
        onSelect(commandKey, entry);
      }
      return;
    }
  });

  if (commands.length === 0) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={1}>
        <Text color="yellow" bold>No 1shot commands found</Text>
        <Text dimColor>Press ESC to cancel</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
      <Text color="cyan" bold>🎯 Select a 1shot command:</Text>
      <Text dimColor>Use ↑↓ arrows to navigate, Enter to select, ESC to cancel</Text>
      <Box flexDirection="column" marginY={1}>
        {commands.map(([key, entry], index) => {
          const isSelected = index === selectedIndex;
          const emoji = entry.prompt.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u)?.[0] || "▸";
          
          return (
            <Box key={key} flexDirection="row" alignItems="center">
              <Text 
                color={isSelected ? "black" : "gray"} 
                {...(isSelected && { backgroundColor: "cyan" })}
              >
                {isSelected ? "►" : " "} {emoji} {key}
              </Text>
              {isSelected && (
                <Box marginLeft={2}>
                  <Text dimColor>
                    - {entry.prompt.replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u, "").slice(0, 50)}
                    {entry.prompt.length > 50 ? "..." : ""}
                  </Text>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      <Text dimColor>
        {commands.length} command{commands.length !== 1 ? "s" : ""} available
      </Text>
    </Box>
  );
};