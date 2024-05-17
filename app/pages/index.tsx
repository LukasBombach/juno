import type { RenderContext } from "juno/renderContext";

export default function DemoPage(ctx: RenderContext) {
  const count = ctx.signal(Math.floor(Math.random() * 100));

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
        <script type="juno/data">{JSON.stringify(ctx.ssrData, null, 2)}</script>
        <script type="module" src="/app/client/index.ts"></script>
      </body>
    </html>
  );
}
