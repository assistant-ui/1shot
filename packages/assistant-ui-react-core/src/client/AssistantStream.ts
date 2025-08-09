type AssistantStreamOperation =
  | {
      readonly type: "set";
      readonly path: readonly string[];
      readonly value: any;
    }
  | {
      readonly type: "append-text";
      readonly path: readonly string[];
      readonly value: string;
    };

export type AssistantStreamChunk<TState> = {
  readonly snapshot: TState;
  readonly operations: readonly AssistantStreamOperation[];
};

export type AssistantStream<TState> = AsyncIterable<
  AssistantStreamChunk<TState>
>;
