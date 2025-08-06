import { tapActions } from "../utils/tap-store";
import { DefaultComposer } from "./DefaultComposer";
import {
  ThreadState,
  UICommandInput,
  UICommand,
  ThreadActions,
} from "./types/thread-types";
import { UIStateConverter } from "./UIStateConverter";
import {
  resource,
  ResourceElement,
  tapMemo,
  tapResource,
  tapState,
} from "@assistant-ui/tap";

export namespace BaseThread {
  export type Props = {
    state: Omit<ThreadState, "composer">;
    onSend: (commands: readonly UICommand[]) => void;
    onCancel?: () => void;
  };
  export type Result = {
    state: ThreadState;
    api: ThreadActions;
  };
}

export const BaseThread = resource(
  (config: BaseThread.Props): BaseThread.Result => {
    const composer = tapResource(
      DefaultComposer({
        get threadAPI(): ThreadActions {
          return api;
        },
      }),
      []
    );

    const api = tapActions<ThreadActions>({
      composer: composer.api,
      send: (input: UICommandInput) => {
        const commands: UICommand[] =
          typeof input === "string"
            ? ([
                {
                  type: "add-message",
                  message: {
                    role: "user",
                    parts: [{ type: "text", text: input }],
                  },
                },
              ] as const)
            : Array.isArray(input)
            ? input
            : ([
                {
                  type: "add-message",
                  message: input,
                },
              ] as const);

        config.onSend(commands);
      },
      cancel: () => {
        const cancel = config.onCancel;
        if (!cancel) throw new Error("Cancelling is not supported");
        cancel();
      },
    });

    const state = tapMemo(() => {
      return {
        ...config.state,
        composer: composer.state,
      };
    }, [config.state, composer.state]);

    return {
      state,
      api,
    };
  }
);

type ThreadClientAdapter<TState> = {
  state: TState;
  send: (payload: {
    commands: readonly UICommand[];
    signal: AbortSignal;
  }) => void;
};

export namespace ThreadClient {
  export type Config<TState> = {
    client: ResourceElement<ThreadClientAdapter<TState>>;
    converter: UIStateConverter<TState>;
  };
}

export const ThreadClient = resource(<T>(config: ThreadClient.Config<T>) => {
  const [cancelController, setCancelController] = tapState<
    AbortController | undefined
  >();

  const converterState = tapMemo(
    () => config.converter.getStore(),
    [config.converter]
  );

  const { state: clientState, send } = tapResource(config.client);
  const state = tapMemo(
    () =>
      converterState.convert({
        state: clientState,
        metadata: { isSending: cancelController !== undefined },
      }),
    [clientState, cancelController]
  );

  return tapResource(
    BaseThread({
      state,
      onSend: (commands) => {
        cancelController?.abort();
        const controller = new AbortController();
        setCancelController(controller);
        return send({
          commands,
          signal: controller.signal,
        });
      },
      onCancel: () => {
        cancelController?.abort();
        setCancelController(undefined);
      },
    })
  );
});
