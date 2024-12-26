import { parse, print } from "@juno/parse";
import { pipe, getFunctions, getJSXElements, filterInteractive, appendHydrationMarker, debug } from "@juno/pipe";

export async function transformServer(src: string): Promise<string> {
  const module = await parse(src);

  // prettier-ignore
  pipe(
    module,
    debug(()=> console.log("===")),
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

transformServer(`
  function App() {
    let count = 1

    return (
      <main>
        <h1>{count}</h1>
        <button onClick={() => count++}>Click me</button>
      </main>
    );
  }
`);
