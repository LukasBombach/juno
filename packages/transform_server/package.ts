import { parse, print } from "@juno/parse";
import {
  appendHydrationMarker,
  filterInteractive,
  getFunctions,
  getJSXElements,
  getJsxRoots,
  getReturnStatements,
  pipe,
  replaceWithHydrationJs,
} from "@juno/pipe";

export async function transformServer(src: string): Promise<string> {
  console.log(`transformServer\n===\n${src}\n===\n`);
  const module = await parse(src);

  // prettier-ignore
  pipe(
    module,
    getFunctions(),
    getJSXElements(),
    filterInteractive(),
    appendHydrationMarker(),
  );

  return await print(module);
}

export async function transformClient(src: string): Promise<string> {
  console.log(`transformClient\n===\n${src}\n===\n`);
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
