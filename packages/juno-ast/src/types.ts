import type { Node as OxcNode, Function } from "oxc-parser";

/**
 * Baseline reexport of all Oxc types
 */
export type * from "oxc-parser";

/**
 * Oxc has only one "Function" Node that includes these node types
 * but we want to have them as separate types
 */
export type FunctionDeclaration = Function & { type: "FunctionDeclaration" };
export type FunctionExpression = Function & { type: "FunctionExpression" };

/**
 * We're gonna reexport the fixed Node Type that includes our Function Node types
 */
export type Node = OxcNode | FunctionDeclaration | FunctionExpression;

/**
 * Utility types for working with Nodes
 */
export type NodeType = Node["type"];
export type NodeOfType<T extends NodeType, N extends Node = Node> = N extends { type: T } ? N : never;
