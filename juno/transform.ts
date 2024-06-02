import { parse, print } from "@swc/core";
import type * as t from "@swc/types";

export type Node =
  | t.Program
  | t.Statement
  | t.Expression
  | t.Declaration
  | t.SpreadElement
  | t.VariableDeclarator
  | t.JSXOpeningElement
  | t.JSXAttribute
  | t.JSXExpressionContainer;

export type NodeType = Node["type"];
export type NodeOfType<T extends NodeType> = Extract<Node, { type: T }>;

export async function transformToClientCode(input: string): Promise<string> {
  const module = await parse(input, { syntax: "typescript", tsx: true });
  const parentMap = createParentMap(module);

  for (const returnStatement of find(module, "ReturnStatement")) {
    const returnVal = getReturnValue(returnStatement);
    const keepJsxElements = new Set<t.JSXElement>();

    if (is(returnVal, "JSXElement")) {
      for (const el of find(returnVal, "JSXElement")) {
        if (hasEventHandler(el)) {
          keepJsxElements.add(el);

          const identifiers = [...find(el, "Identifier")];

          const usages = identifiers.flatMap(identifier =>
            [...find(returnStatement, "Identifier")].filter(id => isSameIdentifier(identifier, id))
          );

          const elements = usages.map(id => findParent(parentMap, id, "JSXElement")).filter(nonNullable);

          elements.forEach(el => keepJsxElements.add(el));
        }
      }
    }

    console.log([...keepJsxElements].map(el => el.opening.name.value));
  }

  return await print(module).then(r => r.code);
}

function createParentMap(node: Node): Map<Node, Node> {
  const parentMap = new Map<Node, Node>();
  let parent = node;
  for (const child of traverse(node)) {
    parentMap.set(child, parent);
    parent = child;
  }
  return parentMap;
}

function findParent<T extends NodeType>(parentMap: Map<Node, Node>, node: Node, type: T): NodeOfType<T> | undefined {
  let parent = parentMap.get(node);
  while (parent) {
    if (is(parent, type)) {
      return parent;
    }
    parent = parentMap.get(parent);
  }
  return undefined;
}

function is<T extends NodeType>(node: Node | undefined, type: T): node is NodeOfType<T> {
  return node?.type === type;
}

function getName(node: t.JSXAttributeOrSpread): string {
  if (is(node, "SpreadElement")) throw new Error("SpreadElement is not supported yet");
  return is(node.name, "Identifier") ? node.name.value : node.name.name.value;
}

function getReturnValue(node: t.ReturnStatement): t.Expression | undefined {
  return is(node.argument, "ParenthesisExpression") ? node.argument.expression : node.argument;
}

function hasEventHandler(node: t.JSXElement): boolean {
  return node.opening.attributes.some(attr => getName(attr).match(/^on[A-Z]/));
}

function isSameIdentifier(a: t.Identifier, b: t.Identifier): boolean {
  return a.value === b.value && a.span.ctxt === b.span.ctxt;
}

function nonNullable<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function* find<T extends NodeType>(parent: Node, type: T): Generator<NodeOfType<T>> {
  for (const node of traverse(parent)) {
    if (is(node, type)) {
      yield node;
    }
  }
}

function* traverse(obj: any): Generator<Node> {
  if (typeof obj === "object" && obj !== null) {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        yield* traverse(obj[i]);
      }
    } else {
      if ("type" in obj) {
        yield obj;
      }
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          yield* traverse(obj[key]);
        }
      }
    }
  }
}
