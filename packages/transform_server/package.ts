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
    getReturnStatements(),
    getJsxRoots(),
    replaceWithHydrationJs()
  );

  return await print(module);
}

const code = `
  function App() {
    let count = 1

    return (
      <main>
        <h1>{count}</h1>
        <button onClick={() => count++}>Click me</button>
      </main>
    );
  }
`;

transformServer(code).then(console.log);
transformClient(code);
