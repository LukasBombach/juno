import { isMatch } from "lodash";
import { Node } from "./types";

export function matches(matcher: object) {
  return (node: Node): boolean => {
    return isMatch(node, matcher);
  };
}
