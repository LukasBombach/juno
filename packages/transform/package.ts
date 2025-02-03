import { parse, print } from "@juno/parse";
import { traverse } from "@juno/traverse";
import {
  appendHydrationMarker,
  getFunctions,
  getJSXElements,
  getJsxRoots,
  getReturnStatements,
  interactiveIdentifiers,
  pipe,
  replaceWithHydrationJs,
} from "@juno/pipe";

import type { Node, t } from "@juno/parse";

export async function transformServer(src: string): Promise<string> {
  const module = await parse(src);

  pipe(module, getFunctions(), fns => {
    fns.forEach(fn => {
      const interactive = pipe(fn, interactiveIdentifiers());
      const props = pipe(fn, propNames());
      const test = pipe([...interactive, ...props], toRegex());

      console.log(
        "p",
        props.map(id => id.value),
        "i",
        interactive.map(id => id.value)
      );

      return pipe(fns, getJSXElements(), usesIdentifier(test), appendHydrationMarker());
    });
  });

  return await print(module);
}

export async function transformClient(src: string): Promise<string> {
  const module = await parse(src);

  // prettier-ignore
  pipe(
    module,
    getFunctions(),
    getReturnStatements(),
    getJsxRoots(),
    replaceWithHydrationJs()
  );

  return await print(module);
}

function propNames() {
  return (fn: Node<"FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression">): t.Identifier[] => {
    const paramsPatterns = fn.type === "ArrowFunctionExpression" ? fn.params : fn.params.map(param => param.pat);

    const props = paramsPatterns[0];

    if (!props) {
      return [];
    }

    if (props?.type === "Identifier") {
      return [props];
    }

    if (props?.type === "ObjectPattern") {
      return props.properties.map(prop => {
        if (prop.type === "AssignmentPatternProperty") {
          return prop.key;
        }

        if (prop.type === "RestElement" && prop.argument.type === "Identifier") {
          return prop.argument;
        }

        throw new Error(`Cannot handle prop type: ${prop.type}`);
      });
    }

    throw new Error(`Cannot handle prop type: ${props.type}`);
  };
}

function usesIdentifier(test: RegExp) {
  return (elements: [el: Node<"JSXElement">, parents: Node[]][]): [el: Node<"JSXElement">, parents: Node[]][] => {
    return elements.filter(([el]) => {
      const attrs = el.opening.attributes
        .filter(attr => attr.type === "JSXAttribute")
        .map(attr => attr.value)
        .filter(val => val !== undefined)
        .filter(val => val.type === "JSXExpressionContainer");

      const ownChildValues = el.children.filter(child => child.type === "JSXExpressionContainer");

      return [...attrs, ...ownChildValues].flatMap(attr => getIdentifiers(attr)).some(id => test.test(id.value));
    });
  };
}

function getIdentifiers(current: Node): t.Identifier[] {
  return Array.from(traverse(current))
    .map(([n]) => n)
    .filter(n => n.type === "Identifier");
}

function toRegex(): (ids: t.Identifier[]) => RegExp {
  return ids => (ids.length ? new RegExp(`^(${ids.map(id => id.value).join("|")})$`) : /never-match^/);
}
