import React, { useState, useEffect } from "react";
import { Box } from "ink";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { Composer } from "./Composer";

import { SystemPromptBox } from "./SystemPromptBox";
import { ThreadPrimitiveMessages, useThread } from "@assistant-ui/react-core";
import { useTerminalSize } from "../hooks/useTerminalSize";
import { SessionSummaryBox } from "./SessionSummaryBox";
import { ProgressBar } from "./ProgressBar";
import { useProgress } from "../contexts/ProgressContext";
import { PostHog } from "posthog-node";

interface ChatInterfaceProps {
  showComposer?: boolean;
  entryName?: string;
  systemPrompt?: string | undefined;
  mcpServers?: Record<string, { command: string; args: string[] }> | undefined;
  posthog: PostHog;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  showComposer = true, 
  entryName,
  systemPrompt,
  mcpServers,
  posthog,
}) => {
  const [distinctId, _] = useState<string>(crypto.randomUUID());
  const { columns } = useTerminalSize();
  const messagesLength = useThread((t) => t.messages.length);
  const isRunning = useThread((t) => t.isRunning);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const { 
    title: progressTitle, 
    subtitle: progressSubtitle, 
    percentage: progressPercentage,
    hasBeenShown: hasShownProgress,
    toolCalls,
  } = useProgress();

  // Initialize only once
  useEffect(() => {
    setIsInitialized(true);
    posthog.capture({
      distinctId,
      event: '1shot_command_started',
      properties: {
        entryName: entryName,
      }
    })
  }, []);

  useEffect(() => {
    if(!isRunning) {
      posthog.capture({
        distinctId,
        event: '1shot_command_not_running',
        properties: {
          entryName: entryName,
        }
      })
    }
  }, [isRunning]);
   
  // Prevent rendering until initialized to avoid duplicate renders
  if (!isInitialized) {
    return null;
  }

  return (
    <Box flexDirection="column" height="100%" width={columns}>
      <Box flexDirection="column" flexGrow={1}>
        <Box flexDirection="column">
          <SystemPromptBox summary={systemPrompt} mcpServers={mcpServers} />
        </Box>
        
        {/* Messages Box - Always visible when there are messages */}
        {messagesLength > 0 && (
          <Box 
            borderStyle="round" 
            borderColor="white" 
            paddingX={1} 
            paddingY={0}
            flexDirection="column"
            flexGrow={1}
            height="50%"
            width={columns}
            overflow="hidden"
          >
            <Box 
              flexDirection="column" 
              flexGrow={1} 
              overflow="hidden"
            >
              <ThreadPrimitiveMessages
                components={{
                  UserMessage,
                  AssistantMessage,
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Loading Animation - Shows when running in interactive mode */}
      {/* {isRunning && isInteractive && <AnimatedSniperCircle />} */}

      {!isRunning && messagesLength > 0 && (
        <SessionSummaryBox systemPrompt={systemPrompt} />
      )}

      {/* Progress Bar - Shows when progress has been shown */}
      {hasShownProgress && (
        <ProgressBar 
          key="progress"
          title={progressTitle} 
          {...(progressSubtitle ? { subtitle: progressSubtitle } : {})}
          percentage={progressPercentage}
          toolCalls={toolCalls}
        />
      )}

      {showComposer && <Composer />}
      
    </Box>
  );
};