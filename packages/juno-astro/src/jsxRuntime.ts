import type { ReactNode, ReactElement } from "react";

/*
 * Aliases to make how react / jsx provides / needs as inputs
 * and outputs more explicit
 */
type TagOrComponent = string | Component;
type VirtualDom = ReactElement;

type Component = (props: Props) => VirtualDom;
type Props = Record<string, any>;

/**
 * Part of the JSX runtime paradigm.
 *
 * Factory function that will receive a transpiled JSX element
 * and returns virtual DOM.
 */
function createElement(type: TagOrComponent, props: Props, ...children: ReactNode[]): VirtualDom {
  if (typeof type === "function") {
    return type({ ...props, children });
  } else {
    return {
      type,
      key: null,
      props: {
        ...props,
        children: children.length === 1 ? children[0] : children,
      },
    };
  }
}

/**
 * Expected export by vite/esbuild setting jsx: automatic
 */
export const jsxDEV = createElement;
