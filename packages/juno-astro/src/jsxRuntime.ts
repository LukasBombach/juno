import type { FC, ReactNode, ReactElement } from "react";

export function createElement(
  type: string | FC,
  props: Record<string, any> | null,
  ...children: ReactNode[]
): ReactElement {
  return {
    type,
    key: null,
    props: {
      ...props,
      children: children.length === 1 ? children[0] : children,
    },
  };
}
