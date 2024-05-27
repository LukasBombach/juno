import { parse, print } from "@swc/core";
import type * as t from "@swc/types";

export async function transformToClientCode(input: string): Promise<string> {
  const module = await parse(input, { syntax: "typescript", tsx: true });
}
