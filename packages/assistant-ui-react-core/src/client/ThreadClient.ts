import {
  resource,
  ResourceElement,
  tapInlineResource,
  tapMemo,
  tapRef,
  tapResource,
  tapState,
} from "@assistant-ui/tap";
import { BaseThread } from "./BaseThread";
import { ConnectionMetadata, UIStateConverter } from "./UIStateConverter";
import { UICommand } from "./types/thread-types";
import { AssistantStream } from "./AssistantStream";

type AssistantStreamThreadBackendProps<TState> = {
  initialState: TState;
  onSend: (state: TState, commands: readonly UICommand[]) => void;
};

// the code for encoding assistant-stream should be in the startAssistantStreamBackend

const createAssistantStream = <TState>(
  initialState: TState,
  handler: (state: TState) => void
): AssistantStream<TState> => {
  return {
    [Symbol.asyncIterator]: async function* () {},
  };
};

export const AssistantStreamThreadBackend = resource(
  <TState>({
    initialState,
    onSend,
  }: AssistantStreamThreadBackendProps<TState>): ThreadBackend<TState> => {
    const [, rerender] = tapState({});
    const stateRef = tapRef<TState>(initialState);
    const busyPromiseRef = tapRef<Promise<void> | undefined>();

    return {
      state: stateRef.current,
      metadata: { isSending: busyPromiseRef.current !== undefined },
      dispatch: async (commands) => {
        while (busyPromiseRef.current) {
          await busyPromiseRef.current;
        }

        busyPromiseRef.current = new Promise(async (resolve) => {
          try {
            const stream = createAssistantStream(stateRef.current, (state) =>
              onSend(state, commands)
            );

            for await (const chunk of stream) {
              stateRef.current = chunk.snapshot;
              rerender({});
            }
          } finally {
            busyPromiseRef.current = undefined;
            rerender({});
            resolve();
          }
        });
        rerender({});
      },
    };
  }
);

type ThreadBackend<TState> = {
  state: TState;
  metadata: ConnectionMetadata;
  dispatch: (commands: readonly UICommand[]) => void;
};

export type ThreadConfig<TState> = {
  backend: ResourceElement<ThreadBackend<TState>>;
  converter: UIStateConverter<TState>;
};

export const Thread = resource(
  <TState>({ backend: backendEl, converter }: ThreadConfig<TState>) => {
    const { state: backendState, metadata, dispatch } = tapResource(backendEl);

    const converterStore = tapMemo(() => converter.getStore(), [converter]);

    const state = tapMemo(
      () => converterStore.convert({ state: backendState, metadata }),
      [converterStore, backendState, metadata]
    );

    return tapInlineResource(BaseThread({ state, onDispatch: dispatch }));
  }
);
