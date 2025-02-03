import type { Node, t } from "@juno/parse";

export function appendHydrationMarker() {
  return (nodes: [el: Node<"JSXElement">, parents: Node[]][]): void => {
    nodes.forEach(([node, parents], i) => {
      const parent = parents[0];
      // const { start } = node.span;
      // console.log("server marker", `juno${i}`);
      const marker = createMarker(`juno-${i}`);
      const newline = jsxNewline();

      if (parent.type === "JSXElement") {
        const index = parent.children.indexOf(node);
        parent.children.splice(index + 1, 0, newline, marker);
        // console.log("appendHydrationMarker", isJsx, index);
      } else {
        throw new Error(`Cannot append marker to parent of type: ${parent.type}`);
      }
    });
  };
}

function jsxNewline(): t.JSXText {
  return {
    type: "JSXText",
    value: "\n        ",
    raw: '"\n        "',
    // @ts-expect-error swc is type wrongfully
    span: { start: 0, end: 0 /* , ctxt: 0 */ },
  };
}

function createMarker(value: string): t.JSXElement {
  // @ts-expect-error swc is type wrongfully
  const span: t.Span = { start: 0, end: 0 /* , ctxt: 0 */ };

  return {
    type: "JSXElement",
    ctxt: 0,
    span,
    children: [],
    opening: {
      type: "JSXOpeningElement",
      ctxt: 0,
      selfClosing: true,
      span,
      name: {
        type: "Identifier",
        // @ts-expect-error swc is type wrongfully
        ctxt: 0,
        value: "script",
        optional: false,
        span,
      },
      attributes: [
        {
          type: "JSXAttribute",
          ctxt: 0,
          span,
          name: {
            type: "Identifier",
            // @ts-expect-error swc is type wrongfully
            ctxt: 0,
            value: "type",
            optional: false,
            span,
          },
          value: {
            type: "StringLiteral",
            // @ts-expect-error swc is type wrongfully
            ctxt: 0,
            value: "juno/h",
            raw: '"juno/h"',
            span,
          },
        },
        {
          type: "JSXAttribute",
          ctxt: 0,
          span,
          name: {
            type: "Identifier",
            // @ts-expect-error swc is type wrongfully
            ctxt: 0,
            value: "id",
            optional: false,
            span,
          },
          value: {
            type: "StringLiteral",
            // @ts-expect-error swc is type wrongfully
            ctxt: 0,
            value: value,
            raw: JSON.stringify(value),
            span,
          },
        },
      ],
    },
  };
}
