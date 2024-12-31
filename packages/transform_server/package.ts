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
import { signal } from "@maverick-js/signals";

export default function Page() {
  const count = signal(Math.floor(Math.random() * 100));

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>juno</title>
      </head>
      <body>
        <p>{count()}</p>
        <button onClick={() => count.set(count() + 1)}>Click</button>
      </body>
    </html>
  );
}
`;

transformServer(code).then(console.log);
transformClient(code).then(console.log);
