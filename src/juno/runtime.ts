import { signal as createSignal, type WriteSignal } from "@maverick-js/signals";

export interface RenderContext {
  signal: <T>(value: T) => WriteSignal<T>;
  signals: WriteSignal<any>[];
  ssrData: Record<string, any>;
}

export function createRenderContext(): RenderContext {
  const signals: WriteSignal<any>[] = [];

  const signal = <T>(value: T) => {
    const s = createSignal<T>(value);
    signals.push(s);
    return s;
  };

  return {
    signal,
    signals,
    get ssrData() {
      return Object.fromEntries(signals.map((s, i) => [i, s()]));
    },
  };
}
