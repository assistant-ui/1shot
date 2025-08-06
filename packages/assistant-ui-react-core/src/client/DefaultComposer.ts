import { resource, tapState, tapMemo } from "@assistant-ui/tap";
import { ComposerState, ComposerActions } from "./types/composer-types";
import { ThreadActions } from "./types/thread-types";
import { tapActions } from "../utils/tap-store";

export namespace DefaultComposer {
  export type Props = {
    threadAPI: ThreadActions;
  };

  export type Result = {
    readonly state: ComposerState;
    readonly api: ComposerActions;
  };
}

export const DefaultComposer = resource(
  (config: DefaultComposer.Props): DefaultComposer.Result => {
    const [text, setText] = tapState("");

    const state = tapMemo(() => ({ text }), [text]);

    const api = tapActions({
      setText,
      send: () => {
        if (text.trim()) {
          config.threadAPI.send({
            role: "user",
            parts: [{ type: "text", text }],
          });
          setText("");
        }
      },
    });

    return {
      state,
      api,
    };
  }
);
