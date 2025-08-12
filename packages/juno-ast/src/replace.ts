import type { Node } from "./types";

export function replaceChild<P extends Node, N extends Node, O extends Node>(
  parent: P,
  newChild: N,
  oldChild: O
): void {
  for (const prop in parent) {
    const child = parent[prop];
    if (child === oldChild) {
      Object.assign(parent, { [prop]: newChild });
    }
    if (Array.isArray(child)) {
      for (let i = 0; i < child.length; i++) {
        if (child[i] === oldChild) {
          child[i] = newChild;
        }
      }
    }
  }
}
