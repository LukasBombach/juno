import type { Node, t } from "@juno/parse";

export function appendHydrationMarker() {
  return (nodes: [el: Node<"JSXElement">, parents: Node[]][]): void => {
    nodes.forEach(node => {
      const { start, end } = node.span;
      const marker = createMarker(`juno-${start}-${end}`);
      insertAfter(node, marker);
    });

    console.log(
      "appendHydrationMarker\n",
      nodes.map(node => `${(node.opening.name as any).value} at ${node.span.start}:${node.span.end}`).join("\n ")
    );
  };
}

function createMarker(value: string): t.JSXElement {
  const span: t.Span = { start: 0, end: 0, ctxt: 0 };
  return {
    type: "JSXElement",
    span,
    children: [],
    opening: {
      type: "JSXOpeningElement",
      selfClosing: true,
      span,
      name: {
        type: "Identifier",
        value: "script",
        optional: false,
        span,
      },
      attributes: [
        {
          type: "JSXAttribute",
          span,
          name: {
            type: "Identifier",
            value: "type",
            optional: false,
            span,
          },
          value: {
            type: "StringLiteral",
            value: "juno/hydration",
            span,
          },
        },
        {
          type: "JSXAttribute",
          span,
          name: {
            type: "Identifier",
            value: "id",
            optional: false,
            span,
          },
          value: {
            type: "StringLiteral",
            value: value,
            span,
          },
        },
      ],
    },
  };
}
