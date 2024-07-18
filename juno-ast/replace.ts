import type { Node, NodeType } from "juno-ast/parse";

export function replace<T extends NodeType, Parent = Node<T>>(parent: Parent): Parent {}
