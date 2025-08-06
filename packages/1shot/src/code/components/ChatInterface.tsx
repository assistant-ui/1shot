import React from "react";
import { Box } from "ink";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { Composer } from "./Composer";
import { AnimatedSniperCircle } from "./AnimatedSniperCircle";
import { SystemPromptBox } from "./SystemPromptBox";
// import { SessionSummaryBox } from "./SessionSummaryBox";
import { ThreadPrimitiveMessages, useThread } from "@assistant-ui/react-core";
import { useTerminalSize } from "../hooks/useTerminalSize";
import { SessionSummaryBox } from "./SessionSummaryBox";
// import { SessionSummaryBox } from "./SessionSummaryBox";

interface ChatInterfaceProps {
  showComposer?: boolean;
  systemPrompt?: string | undefined;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ showComposer = true, systemPrompt }) => {
  const { columns } = useTerminalSize();
  const messagesLength = useThread((t) => t.messages.length);
  const isRunning = useThread((t) => t.isRunning);
  
   
  return (
    <Box flexDirection="column" height="100%" width={columns}>
      <Box flexDirection="column" flexGrow={1} marginBottom={1}>
        <Box marginY={1} flexDirection="column">
          <SystemPromptBox summary={systemPrompt} />
        </Box>
        
        {messagesLength > 0 && (
          <Box 
            borderStyle="round" 
            borderColor="white" 
            paddingX={1} 
            paddingY={0}
            flexDirection="column"
            flexGrow={1}
            height="60%"
            width={columns}
            overflow="hidden"
          >
            <Box 
              flexDirection="column" 
              flexGrow={1} 
              overflow="hidden"
              paddingY={1}
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
      {isRunning && <AnimatedSniperCircle />}

      {showComposer && isRunning && <Composer />}
      
     
      {!isRunning && messagesLength > 0 && systemPrompt && (
        <SessionSummaryBox systemPrompt={systemPrompt} />
      )}
      
    </Box>
  );
};