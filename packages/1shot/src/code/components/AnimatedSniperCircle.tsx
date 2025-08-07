import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { useThread } from "@assistant-ui/react-core";

const AnimatedDots = () => {
  const [dotCount, setDotCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((count) => (count + 1) % 4); // Cycle through 0, 1, 2, 3
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return ".".repeat(dotCount);
};

export const AnimatedSniperCircle: React.FC = () => {
  const isRunning = useThread((t) => t.isRunning);
  const usage = useThread((t) => t.metadata?.usage);
  const totalTokens = (usage?.inputTokens || 0) + (usage?.outputTokens || 0);

  if (!isRunning) return null;

  return (
    <Box justifyContent="flex-start" marginBottom={1}>
      <Text color="red">
        Working<AnimatedDots />{totalTokens > 0 ? ` (${totalTokens} tokens)` : ''}
      </Text>
    </Box>
  );
};