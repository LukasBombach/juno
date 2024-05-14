import { signal as maverickSignal } from "@maverick-js/signals";
import { inspect } from "node:util";

export { effect } from "@maverick-js/signals";

export function signal<T>(value: T) {
  const s = maverickSignal<T>(value);
  console.debug(inspect(s, { colors: true, depth: 10 }));
  return s;
}
