import { render } from "ink";
import { ChatProvider } from "./AssistantCodeThread";
import { ChatInterface } from "./components/ChatInterface";
import { AssistantCodeConfig } from "./AssistantCode";

export type { AssistantCodeConfig } from "./AssistantCode";

export interface RenderAssistantCodeConfig extends AssistantCodeConfig {
  showComposer?: boolean;
  BehaviorComponent?: React.FC;
}

export const renderAssistantCode = (config: RenderAssistantCodeConfig) => {
  const { BehaviorComponent = () => null, showComposer = true, systemPrompt, ...assistantConfig } = config;
  
  render(
    <ChatProvider config={assistantConfig}>
      <ChatInterface showComposer={showComposer} systemPrompt={systemPrompt} />
      <BehaviorComponent />
    </ChatProvider>
  );
};
