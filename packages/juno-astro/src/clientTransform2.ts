import { basename } from "node:path";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import { parseSync } from "oxc-parser";
import { print } from "esrap";
import tsx from "esrap/languages/tsx";
import { pipe, is, as, not, b, replaceChild } from "juno-ast";
import { findAllByType, findAllByTypeShallow, findFirstByType, findParent } from "juno-ast";
import { astId, findComponents, findClientIdentifiers, containsIdentifiers } from "./sharedTransform";
import type { JSXElement, Expression, NodeOfType, Program } from "juno-ast";

export function transformJsxClient(input: string, filename: string) {
  const { program } = parseSync(basename(filename), input, { sourceType: "module", lang: "tsx", astType: "ts" });

  injectJunoComponentsPreflight(program, filename);

  return print(program, tsx(), { indent: "  " });
}

/**
 * window.JUNO_COMPONENTS preflight:
 *
 * window.JUNO_COMPONENTS = {};
 * window.JUNO_COMPONENTS["a12e"] = Component;
 */
function injectJunoComponentsPreflight(program: Program, filename: string) {
  program.body.unshift(
    b.ExpressionStatement(
      b.AssignmentExpression(
        b.MemberExpression(b.ident("window"), "JUNO_COMPONENTS"),
        b.LogicalExpression(b.MemberExpression(b.ident("window"), "JUNO_COMPONENTS"), "??", b.object({}))
      )
    )
  );
  pipe(
    program,
    findComponents,
    A.map(fn => {
      program.body.push(
        b.ExpressionStatement(
          b.AssignmentExpression(
            b.MemberExpression(b.MemberExpression(b.ident("window"), "JUNO_COMPONENTS"), astId(filename, fn)),
            // @ts-expect-error wip
            b.ident(fn.id?.name)
          )
        )
      );
    })
  );
}
