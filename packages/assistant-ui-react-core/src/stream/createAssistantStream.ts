import { ReadonlyJSONValue } from "../utils/json-types";
import { AssistantStreamChunk, AssistantStreamOperation } from "./types";
import { AssistantStreamAccumulator } from "./AssistantStreamAccumulator";
import { withPromiseOrValue } from "../utils/withPromiseOrValue";
import { asAsyncIterableStream } from "../utils/stream/AsyncIterableStream";

type AssistantStreamController<TState = ReadonlyJSONValue> = {
  readonly abortSignal: AbortSignal;
  readonly state: TState; // mutable draft proxy
  enqueue(operations: readonly AssistantStreamOperation[]): void;
  appendText(path: readonly string[], text: string): void;
};

class ControllerImpl<TState extends ReadonlyJSONValue>
  implements AssistantStreamController<TState>
{
  private _controller: ReadableStreamDefaultController<
    AssistantStreamChunk<TState>
  >;
  private _abortController = new AbortController();
  private _accumulator: InstanceType<typeof AssistantStreamAccumulator>;
  private _cancelled = false;
  private _draft: any;

  constructor(
    controller: ReadableStreamDefaultController<AssistantStreamChunk<TState>>,
    defaultValue: TState
  ) {
    this._controller = controller as unknown as ReadableStreamDefaultController<
      AssistantStreamChunk<TState>
    >;
    this._accumulator = new AssistantStreamAccumulator(defaultValue);
    this._draft = this._createDraftProxy([]);
  }

  get abortSignal() {
    return this._abortController.signal;
  }

  get state() {
    return this._draft as TState;
  }

  // Enqueue synchronously so a synchronous execute() can't close the stream
  // before its operations are written.
  enqueue(operations: readonly AssistantStreamOperation[]) {
    if (this._cancelled || operations.length === 0) return;

    this._accumulator.append(operations);
    this._controller.enqueue({
      snapshot: this._accumulator.state as TState,
      operations,
    });
  }

  appendText(path: readonly string[], text: string) {
    this.enqueue([{ type: "append-text", path, value: text }]);
  }

  // A cancelled stream is already closed, so settling it again would throw.
  __internalError(error: unknown) {
    if (this._cancelled) return;
    this._controller.error(error);
  }

  __internalClose() {
    if (this._cancelled) return;
    this._controller.close();
  }

  __internalCancel(reason?: unknown) {
    this._cancelled = true;
    this._abortController.abort(reason);
  }

  private _createDraftProxy(path: readonly string[]): any {
    const getAtPath = (targetPath: readonly string[]): ReadonlyJSONValue | undefined => {
      // enqueue() applies operations immediately, so the accumulator state is current
      let cur: ReadonlyJSONValue | undefined = this._accumulator.state;
      for (const key of targetPath) {
        if (cur == null || typeof cur !== "object") return undefined;
        cur = (cur as any)[key];
      }
      return cur;
    };

    return new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === Symbol.toStringTag) return "Object";
          if (prop === Symbol.iterator) return undefined;
          if (prop === "valueOf") return () => getAtPath(path);
          // For reading primitives, return the current value
          if (typeof prop === "string" || typeof prop === "number") {
            const nextPath = [...path, String(prop)];
            const value = getAtPath(nextPath);
            if (value !== null && typeof value === "object") {
              return this._createDraftProxy(nextPath);
            }
            return value;
          }
          return undefined;
        },
        set: (_target, prop, value) => {
          const key = String(prop);
          const nextPath = [...path, key];
          const op: AssistantStreamOperation = {
            type: "set",
            path: nextPath,
            value: value as ReadonlyJSONValue,
          };
          this.enqueue([op]);
          return true;
        },
      }
    );
  }
}

const getStreamControllerPair = <TState extends ReadonlyJSONValue>(
  defaultValue: TState
) => {
  let controller!: ControllerImpl<TState>;
  const stream = new ReadableStream<AssistantStreamChunk<TState>>({
    start(c) {
      controller = new ControllerImpl<TState>(c, defaultValue);
    },
    cancel(reason: unknown) {
      controller.__internalCancel(reason);
    },
  });

  return [asAsyncIterableStream(stream), controller] as const;
};

type CreateAssistantStreamOptions<TState extends ReadonlyJSONValue> = {
  execute: (controller: AssistantStreamController<TState>) => void | PromiseLike<void>;
  defaultValue?: TState;
};

export const createAssistantStream = <TState extends ReadonlyJSONValue = ReadonlyJSONValue>({
  execute,
  defaultValue,
}: CreateAssistantStreamOptions<TState>) => {
  const [stream, controller] = getStreamControllerPair(
    (defaultValue ?? ({} as unknown as TState)) as TState
  );

  withPromiseOrValue(
    () => execute(controller),
    () => {
      controller.__internalClose();
    },
    (e: unknown) => {
      controller.__internalError(e);
    }
  );

  return stream;
};
