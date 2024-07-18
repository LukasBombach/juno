import { findAll } from "juno-ast/find";
import { getScope } from "juno-ast/scope";
import { is, exclude } from "juno-ast/filter";

import type * as t from "@swc/types";
import type { Node } from "juno-ast/parse";
import type { PipeApi, Option, PipableValue } from "juno-ast/pipe";

export function getReferences(): (node: PipableValue<Node>, api: PipeApi) => t.Identifier[] {
  return (node, { pipe }) =>
    pipe(
      node,
      is("Identifier"),
      getScope(),
      findAll({ type: "Identifier", value: (node as t.Identifier).value }),
      exclude(node)
    );
}
