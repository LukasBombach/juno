import { parse, print } from "@juno/parse";
import { pipe, getFunctions } from "@juno/pipe";

export async function transformServer(src: string): Promise<string> {
  const module = await parse(src);

  // prettier-ignore
  pipe(
    module,
    getFunctions(),
    //getJxElements(),
    //filterInteractive(),
    //appendHydrationMarker(),
  );

  return await print(module);
}

export async function transformClient(src: string): Promise<string> {
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
