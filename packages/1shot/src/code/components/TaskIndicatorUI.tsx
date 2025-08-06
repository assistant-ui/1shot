import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { useThread } from "@assistant-ui/react-core";

const TimeElapsed = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return timeElapsed;
};

export const TaskIndicatorUI: React.FC = () => {
  const isRunning = useThread((t) => t.isRunning);
  if (!isRunning) return null;

  return (
    <Box marginBottom={1}>
      <Text>
        <Text color="yellow">💬 Thinking... </Text>
        <Text dimColor>
          (<TimeElapsed />s · <Text bold>esc</Text> to interrupt)
        </Text>
      </Text>
    </Box>
  );
};
