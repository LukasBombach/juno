import { basename } from "node:path";
import { createHash } from "node:crypto";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import oxc from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
// import { highlight } from "cli-highlight";
// import c from "chalk";
import { pipe, is, as, b } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType } from "juno-ast";
import type { JSXElement } from "juno-ast";

export function transformJsxServer(input: string, id: string) {
  const { program } = oxc.parseSync(basename(id), input, { sourceType: "module", lang: "tsx", astType: "js" });

  // console.log("\n" + c.blue("[ssr]") + " " + c.greenBright(id) + "\n");

  pipe(
    program,
    findAllByType("FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"),
    A.flatMap(findAllByTypeShallow("ReturnStatement")),
    A.map(returnStatement => {
      pipe(
        returnStatement,
        findAllByTypeShallow("JSXElement"),
        A.map(jsxRoot => {
          addHydrationIds(jsxRoot, id);
        })
      );
    })
  );

  const { code, map } = print(program, tsx(), { indent: "  " });

  // console.log(highlight(code, { language: "tsx" }));

  return { code, map };
}

function addHydrationIds(jsxRoot: JSXElement, filename: string) {
  pipe(
    jsxRoot,
    findAllByType("JSXElement"),
    A.map(el => {
      const shouldBeHydrated = pipe(
        jsxRoot.openingElement,
        findAllByType("JSXAttribute"),
        A.filter(attr => {
          const name = as.JSXIdentifier(attr.name)?.name;
          return name === "ref" || Boolean(name?.match(/^on[A-Z]/));
        }),
        A.reduce(0, (len, attr) => {
          const name = as.JSXIdentifier(attr.name)?.name;
          const value = pipe(
            attr,
            O.fromNullableK(findFirstByType("JSXExpressionContainer")),
            O.map(v => (is.JSXEmptyExpression(v.expression) ? b.identName("undefined") : v.expression)),
            O.toUndefined
          );
          return name && value ? len + 1 : len;
        }),
        len => len > 0
      );

      if (shouldBeHydrated) {
        el.openingElement.attributes.unshift(b.jsxAttr("data-juno-id", astId(filename, el.start)));
      }
    })
  );
}

function astId(filename: string, loc: number, length = 4): string {
  return createHash("md5").update(`${filename}${loc}`).digest("hex").substring(0, length);
}
