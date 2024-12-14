import { parse, print } from "@juno/parse";
import { pipe, getFunctions, getJSXElements, filterInteractive, appendHydrationMarker } from "@juno/pipe";

export async function transformServer(src: string): Promise<string> {
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
  const module = await parse(src);

  // prettier-ignore
  pipe(
    module,
    getFunctions(),
    // getReturnStatements(),
    // getJsxRoots(),
    // replaceWithHydrationJs()
  );

  return await print(module);
}
