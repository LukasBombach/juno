import { basename } from "node:path";
import oxc from "oxc-parser";

export function transformComponents(code: string, id: string) {
  const { program } = oxc.parseSync(basename(id), code, { sourceType: "module", lang: "tsx", astType: "js" });
  console.log(program);
  return code;
}
