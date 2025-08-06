import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { useThread } from "@assistant-ui/react-core";
import { useTerminalSize } from "../hooks/useTerminalSize";

const TimeElapsed = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return timeElapsed;
};

const BlinkingEmoji = ({ emoji }: { emoji: string }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => setVisible((v) => !v), 500);
    return () => clearInterval(interval);
  }, []);

  return visible ? emoji : " ";
};

export const AnimatedSniperCircle: React.FC = () => {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const { columns } = useTerminalSize();
  const maxWidth = Math.min(columns - 20, 60); // Responsive width with padding
  const isRunning = useThread((t) => t.isRunning);
  const messagesLength = useThread((t) => t.messages.length);
  const usage = useThread((t) => t.metadata.usage);
  const totalTokens = usage.inputTokens + usage.outputTokens;

  useEffect(() => {
    // Adjust animation speed based on message count
    // Fast at the beginning (50ms), slower when messages come in (150ms)
    const animationSpeed = messagesLength > 0 ? 150 : 50;
    
    const interval = setInterval(() => {
      setPosition((prev) => {
        const newPos = prev + direction;
        if (newPos >= maxWidth || newPos <= 0) {
          setDirection(-direction);
          return prev;
        }
        return newPos;
      });
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [direction, maxWidth, messagesLength]);

  // Create the sniper circle with crosshairs
  const sniperCircle = "◉";
  
  // Create the horizontal line with the sniper circle at the current position
  const line = "━".repeat(maxWidth);
  const displayLine = line.slice(0, position) + sniperCircle + line.slice(position + 1);

  return (
    <Box flexDirection="column" alignItems="center">
      <Text bold color="red">
        {displayLine}
      </Text>
      <Text dimColor color="gray">
        🎯 1Shot Activated ({isRunning ? <TimeElapsed /> : 0}s) - {isRunning && <BlinkingEmoji emoji="⚡" />} {totalTokens} tokens
        {/* - ctrl+c to interrupt */}
      </Text>
    </Box>
  );
}