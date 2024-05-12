import { parseSync as swc, type Module } from "@swc/core";
import { parse as recast, type Options } from "recast";

export default function parse(source: string, options?: Partial<Options>): Module {
  return recast(source, {
    parser: {
      parse: swc,
    },
    ...options,
  });
}
