import { signal as createSignal, type WriteSignal } from "@maverick-js/signals";

export interface RenderContext {
  signal: <T>(value: T) => WriteSignal<T>;
  ssrData: any[];
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
    get ssrData() {
      return signals.map((s) => s());
    },
  };
}
