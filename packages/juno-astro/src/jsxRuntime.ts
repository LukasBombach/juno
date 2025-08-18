/**
 * @fileoverview
 * This file exports various methods that implement Babel's "automatic" JSX runtime API:
 * - jsx(type, props, key)
 * - jsxs(type, props, key)
 * - jsxDEV(type, props, key, __source, __self)
 *
 * Types are gratefully copied (and altered) from preact/jsx-runtime
 */

export const vnode = Symbol("vnode");

export interface VNode<P = Record<string, unknown>> {
  type: string;
  props: P & { children: ComponentChildren };
  key?: Key;
  [vnode]: true;
}

interface FunctionComponent<P = {}> {
  (props: RenderableProps<P>, context?: any): VNode<P>; // ComponentChildren; purposely ignoring the truth for easier development
  displayName?: string;
  defaultProps?: Partial<P> | undefined;
}

interface Attributes {
  key?: Key | undefined;
  jsx?: boolean | undefined;
}

interface Source {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
}

type Key = string | number | any;
type RefObject<T> = { current: T | null };
type RefCallback<T> = (instance: T | null) => void | (() => void);
type Ref<T> = RefObject<T> | RefCallback<T> | null;
type ComponentChildren = ComponentChild[] | ComponentChild;
type ComponentChild = VNode<any> | object | string | number | bigint | boolean | null | undefined;
type RenderableProps<P, RefType = any> = P &
  Readonly<Attributes & { children?: ComponentChildren; ref?: Ref<RefType> }>;

/**
 * Creates a VNode for a component or HTML element.
 * This function is used to implement the JSX runtime API.
 * It takes a type (either a function component or a string for HTML elements),
 * props (including children), a key, and a flag indicating if the children are static.
 * It returns a VNode that represents the component or element.
 */
function createVNode<P = {}>(
  type: FunctionComponent<P> | string,
  props: P & { children: ComponentChildren },
  _key: Key,
  _isStaticChildren: boolean,
  _source: Source
): VNode<P> {
  // todo: hide vnode prop in prototype
  return typeof type === "function" ? createJunoComponentVNode(type, props) : { type, props, [vnode]: true };
}

function createJunoComponentVNode<P = {}>(type: FunctionComponent<P>, props: P): VNode<P> {
  return {
    type: "juno-component",
    // @ts-expect-error fixlater
    props: {
      // @ts-expect-error fixlater
      children: type(props),
    },
    [vnode]: true,
  };
}

/**
 * Creates a fragment VNode for grouping children without adding extra nodes to the DOM.
 * This is used to support JSX fragments in the automatic runtime.
 */
export function createFragmentVNode(props: VNode["props"]): VNode["props"]["children"] {
  return props.children;
}

export const jsx = createVNode;
export const jsxs = createVNode;
export const jsxDEV = createVNode;
export const Fragment = createFragmentVNode;
