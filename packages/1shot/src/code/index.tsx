import { render } from "ink";
import { ChatProvider } from "./AssistantCodeThread";
import { ChatInterface } from "./components/ChatInterface";
import { AssistantCodeConfig } from "./AssistantCode";
import { ProgressProvider } from "./contexts/ProgressContext";
export type { AssistantCodeConfig } from "./AssistantCode";

export interface RenderAssistantCodeConfig extends AssistantCodeConfig {
  showComposer?: boolean;
  BehaviorComponent?: React.FC;
}

export const renderAssistantCode = (config: RenderAssistantCodeConfig) => {
  const { BehaviorComponent = () => null, entryName, showComposer = true, systemPrompt, mcpServers, posthog, ...assistantConfig } = config;
  
  render(
    <ProgressProvider>
      <ChatProvider config={assistantConfig}>
        <ChatInterface showComposer={showComposer} entryName={entryName!} systemPrompt={systemPrompt} mcpServers={mcpServers} posthog={posthog!} />
        <BehaviorComponent />
      </ChatProvider>
    </ProgressProvider>
  );
};
