import isMatch from "lodash/isMatch";
import { Node } from "./types";

export function matches(matcher: object) {
  return (node: Node): boolean => {
    return isMatch(node, matcher);
  };
}
