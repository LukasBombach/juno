import { matches } from "lodash";
import { traverse } from "juno-ast/traverse";
import type { Option } from "juno-ast/pipe";
import type { Node, NodeType } from "juno-ast/parse";

export type Query<T extends NodeType> = { type: T } & Record<string, unknown>;
