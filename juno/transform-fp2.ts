import { pipe } from "fp-ts/function";
import { parse } from "juno/ast";
import { matches } from "lodash";

import type * as t from "@swc/types";

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });

  for (const fn of module.find("FunctionExpression")) {
    const signalCalls = pipe(
      fn.node,
      children({ type: "Parameter", index: 0, pat: { type: "Identifier" } })
      // references(),
      // parent({ type: "MemberExpression", property: { type: "Identifier", value: "signal" } }),
      // parent({ type: "CallExpression" })
    );

    console.log(signalCalls);
  }

  return src;
}

type Query = Record<string, unknown>;

type Node =
  | t.Program
  | t.Statement
  | t.Expression
  | t.Declaration
  | t.SpreadElement
  | t.VariableDeclarator
  | t.JSXOpeningElement
  | t.JSXAttribute
  | t.JSXExpressionContainer;

function children({ index: queryIndex, ...query }: Query) {
  return (node: Node): Node[] => {
    const children: Node[] = [];
    const matcher = matches(query);
    const isMatch =
      queryIndex === undefined ? matcher : (child: Node, index: number) => index === queryIndex && matcher(child);
    traverseWithParent(node, (child, parent, prop, index) => {
      if (isMatch(child, index)) children.push(child);
    });
    return children;
  };
}

function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && "type" in value;
}

function traverseWithParent(
  current: Node,
  callback: (node: Node, parent: Node, property: string, index: number) => void
): void {
  let parent = current;
  let property: keyof typeof parent;

  for (property in parent) {
    const child = parent[property];
    if (isNode(child)) {
      callback(child, parent, property, -1);
      traverseWithParent(child, callback);
    }
    if (Array.isArray(child)) {
      for (const i in child) {
        const nthChild = child[i];
        if (isNode(nthChild)) {
          callback(nthChild, parent, property, parseInt(i, 10));
          traverseWithParent(nthChild, callback);
        }
      }
    }
  }
}

function* traverse(obj: any): Generator<Node> {
  if (typeof obj === "object" && obj !== null && "type" in obj) {
    yield obj;
  }

  if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        yield* traverse(obj[i]);
      }
    } else {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          yield* traverse(obj[key]);
        }
      }
    }
  }
}
