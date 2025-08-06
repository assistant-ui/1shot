import { UserThreadMetadata } from "../../utils/augmentation";
import type { TextUIPart, UIMessage } from "./message-types";
import { ComposerActions, ComposerState } from "./composer-types";

export type AddMessageUICommand = {
  readonly type: "add-message";
  readonly message: {
    readonly role: "user";
    readonly parts: readonly TextUIPart[];
  };
};

export type AddToolApprovalUICommand = {
  readonly type: "add-tool-approval";
  readonly toolCallId: string;
  readonly decision: "approve" | "reject";
};

export type UICommand = AddMessageUICommand | AddToolApprovalUICommand;

export type UICommandInput =
  | string
  | AddMessageUICommand["message"]
  | readonly UICommand[];

export type ThreadActions = {
  composer: ComposerActions;

  send(commands: UICommandInput): void;
  cancel(): void;
};

export type ThreadState = {
  readonly composer: ComposerState;
  readonly isRunning: boolean;
  readonly messages: readonly UIMessage[];
  readonly metadata: UserThreadMetadata;
  // readonly state: UserThreadState
};
