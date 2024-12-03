import { parse, print } from "@juno/parse";

export async function transformServer(src: string): Promise<string> {
  const module = await parse(src);

  getJsxElements(module).filter(shouldBeHydrated).forEach(appendHydrationMarker);

  return await print(module);
}

export async function transformClient(src: string): Promise<string> {
  const module = await parse(src);

  const jsxReturns = getFunctions(module)
    .flatMap(getReturnStatements)
    .filter(returnsJsx)
    .forEach((rtn) => replace(rtn, toHydrationInstructions(rtn)));

  for (const fn of getFunctions(module)) {
    for (const rtnStatement of getReturnStatements(fn)) {
      if (returnsJsx(rtnStatement)) {
        replace(rtnStatement, toHydrationInstructions(rtnStatement));
      }
    }
  }

  getFunctions(module).forEach((fn) => {
    getReturnStatements(fn)
      .filter(returnsJsx)
      .forEach((returnStatement) => {
        replace(returnStatement, toHydrationInstructions(returnStatement));
      });
  });

  return await print(module);
}
