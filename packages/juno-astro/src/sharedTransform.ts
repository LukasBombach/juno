import { createHash } from "node:crypto";
import { Node } from "juno-ast";

export function astId(filename: string, node: Node): string {
  return createHash("md5")
    .update(`${filename.slice(-16)}:${node.start}:${node.end}`)
    .digest("hex")
    .substring(0, 5);
}
