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

type Child = Node;
type Parent = Node;

type ParentMap = Map<Child, Parent>;

const span: t.Span = {
  start: 0,
  end: 0,
  ctxt: 0,
};

export async function transformToClientCode(src: string): Promise<string> {
  const module = await parse(src, { syntax: "typescript", tsx: true });
  const parentMap = createParentMap(module);

  for (const functionLike of find(module, "FunctionExpression")) {
    const ctxParam = is("Identifier")(functionLike.params[0].pat) ? functionLike.params[0].pat : null;
    const usages = ctxParam ? [...find(functionLike, "Identifier")].filter((id) => isSameIdentifier(id, ctxParam)) : [];
    usages
      .map((id) => parentMap.get(id))
      .filter(is("MemberExpression"))
      .filter((memberExpr) => {
        return memberExpr.property.type === "Identifier" && memberExpr.property.value === "signal";
      })
      .map((memberExpr) => parentMap.get(memberExpr))
      .filter(is("CallExpression"))
      .forEach((callExpr, i) => {
        const span: t.Span = {
          start: 0,
          end: 0,
          ctxt: ctxParam?.span.ctxt ?? 0,
        };

        callExpr.arguments = [
          {
            spread: undefined,
            expression: {
              type: "MemberExpression",
              span,
              object: {
                type: "MemberExpression",
                span,
                object: {
                  type: "Identifier",
                  span,
                  value: "ctx",
                  optional: false,
                },
                property: {
                  type: "Identifier",
                  span,
                  value: "ssrData",
                  optional: false,
                },
              },
              property: {
                type: "Computed",
                span,
                expression: {
                  type: "NumericLiteral",
                  span,
                  value: i,
                },
              },
            },
          },
        ];
      });

    for (const returnStatement of find(functionLike, "ReturnStatement")) {
      const returnVal = getReturnValue(returnStatement);
      const reactiveIdentifiers = new Set<t.Identifier>();
      const keepJsxElements = new Set<t.JSXElement>();

      if (is("JSXElement")(returnVal)) {
        for (const el of find(returnVal, "JSXElement")) {
          if (hasEventHandler(el)) {
            keepJsxElements.add(el);

            for (const identifier of find(el, "Identifier")) {
              reactiveIdentifiers.add(identifier);
            }
          }
        }
      }

      for (const reactiveidentifier of reactiveIdentifiers) {
        for (const identifier of find(returnStatement, "Identifier")) {
          if (isSameIdentifier(reactiveidentifier, identifier)) {
            reactiveIdentifiers.add(identifier);
          }
        }
      }

      for (const reactiveidentifier of reactiveIdentifiers) {
        const parentElement = findParent(parentMap, reactiveidentifier, "JSXElement");
        if (parentElement) keepJsxElements.add(parentElement);
      }

      const jsxElements = [...keepJsxElements].sort((a, b) => a.span.start - b.span.start);

      returnStatement.argument = {
        type: "ArrayExpression",
        span,
        elements: jsxElements.map((el) => convertToHydrationDirective(parentMap, reactiveIdentifiers, el)),
      };
    }
  }

  return await print(module).then((r) => {
    return r.code;
  });
}

function convertToHydrationDirective(
  parentMap: ParentMap,
  reactiveIdentifiers: Set<t.Identifier>,
  el: t.JSXElement
): t.ExprOrSpread {
  return {
    expression: {
      type: "ObjectExpression",
      span,
      properties: [
        {
          type: "KeyValueProperty",
          key: {
            type: "Identifier",
            span,
            value: "path",
            optional: false,
          },
          value: {
            type: "ArrayExpression",
            span,
            elements: getParentPath(parentMap, el),
          },
        },
        ...getClientProperties(el, reactiveIdentifiers, parentMap),
      ],
    },
  };
}

function getClientProperties(
  node: t.JSXElement,
  reactiveIdentifiers: Set<t.Identifier>,
  parentMap: Map<Node, Node>
): t.KeyValueProperty[] {
  const props: t.KeyValueProperty[] = node.opening.attributes
    .filter(is("JSXAttribute"))
    .filter((attr) => [...reactiveIdentifiers.values()].some((id) => getParents(id, parentMap).includes(attr)))
    .map((prop): [string, t.Expression] => {
      const name = getName(prop);

      if (!prop.value) {
        throw new Error(`JSXAttribute ${name} has no value`);
      }

      if (!is("JSXExpressionContainer")(prop.value)) {
        throw new Error(`JSXAttribute ${name} has an unsupported value`);
      }

      if (is("JSXEmptyExpression")(prop.value.expression)) {
        throw new Error(`JSXAttribute ${name} has an empty expression`);
      }

      return [name, prop.value.expression];
    })
    .map(([name, expression]) => {
      return {
        type: "KeyValueProperty",
        key: {
          type: "Identifier",
          span,
          value: name,
          optional: false,
        },
        value: expression,
      };
    });

  const childrenThatAreExpressions = node.children
    .filter(is("JSXExpressionContainer"))
    .map((child) => child.expression)
    .filter((exp): exp is t.Expression => exp.type !== "JSXEmptyExpression") // todo unsafe way to get expressions only
    .map((exp) => {
      if (exp.type === "CallExpression" && is("Identifier")(exp.callee) && reactiveIdentifiers.has(exp.callee)) {
        return exp.callee;
      }
      return exp;
    });

  const children: t.KeyValueProperty = {
    type: "KeyValueProperty",
    key: {
      type: "Identifier",
      span,
      value: "children",
      optional: false,
    },
    value: {
      type: "ArrayExpression",
      span,
      elements: childrenThatAreExpressions.map((exp) => ({ expression: exp })),
    },
  };

  return [...props, ...(childrenThatAreExpressions.length ? [children] : [])];
}

function getParentPath(parentMap: Map<Node, Node>, el: t.JSXElement): t.ExprOrSpread[] {
  // gets the null-based index if child in parent.children but disregards JSXText that contains only whitespace
  function getJsxElementIndex(parent: t.JSXElement, child: t.JSXElement): number {
    let index = 0;
    for (const node of parent.children) {
      if (node.type === "JSXText" && !node.value.trim()) continue;
      if (node === child) return index;
      index++;
    }
    return -1;
  }

  const path: number[] = [];
  let child = el;
  let parent = parentMap.get(child);
  while (parent?.type === "JSXElement") {
    path.push(getJsxElementIndex(parent, child));
    child = parent;
    parent = parentMap.get(parent);
  }

  return path
    .reverse()
    .map((i) => i + 1) // 1-based index
    .map(
      (value: number): t.ExprOrSpread => ({ spread: undefined, expression: { type: "NumericLiteral", span, value } })
    );
}

function getParents(node: Node, parentMap: Map<Node, Node>): Node[] {
  const parents: Node[] = [];
  let parent = parentMap.get(node);
  while (parent) {
    parents.push(parent);
    parent = parentMap.get(parent);
  }
  return parents;
}

function findParent<T extends NodeType>(parentMap: Map<Node, Node>, node: Node, type: T): NodeOfType<T> | undefined {
  let parent = parentMap.get(node);
  while (parent) {
    if (is(type)(parent)) {
      return parent;
    }
    parent = parentMap.get(parent);
  }
  return undefined;
}

function is<T extends NodeType>(type: T): (node: unknown) => node is NodeOfType<T> {
  return (node): node is NodeOfType<T> =>
    typeof node === "object" && node !== null && "type" in node && node.type === type;
}

function getName(node: t.JSXAttributeOrSpread): string {
  if (is("SpreadElement")(node)) throw new Error("SpreadElement is not supported yet");
  return is("Identifier")(node.name) ? node.name.value : node.name.name.value;
}

function getReturnValue(node: t.ReturnStatement): t.Expression | undefined {
  return is("ParenthesisExpression")(node.argument) ? node.argument.expression : node.argument;
}

function hasEventHandler(node: t.JSXElement): boolean {
  return node.opening.attributes.some((attr) => getName(attr).match(/^on[A-Z]/));
}

function isSameIdentifier(a: t.Identifier, b: t.Identifier): boolean {
  return a.value === b.value && a.span.ctxt === b.span.ctxt;
}

function* find<T extends NodeType>(parent: Node, type: T): Generator<NodeOfType<T>> {
  for (const node of traverse(parent)) {
    if (is(type)(node)) {
      yield node;
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

function isNode(value: unknown): value is Node {
  return typeof value === "object" && value !== null && "type" in value;
}

function createParentMap(node: Node, parentMap = new Map<Child, Parent>()): ParentMap {
  let parent = node;
  let property: keyof typeof parent;

  for (property in parent) {
    const child = parent[property];
    if (isNode(child)) {
      parentMap.set(child, parent);
      createParentMap(child, parentMap);
    }
    if (Array.isArray(child)) {
      for (const nthChild of child) {
        if (isNode(nthChild)) {
          parentMap.set(nthChild, parent);
          createParentMap(nthChild, parentMap);
        }
      }
    }
  }

  return parentMap;
}
