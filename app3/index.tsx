import { render } from "juno/server";
import { hydrate } from "juno/client";

import type { RenderContext } from "juno/server";

function Page(ctx: RenderContext) {
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
      </body>
    </html>
  );
}

export default () => {
  if (process.env.server) {
    return render(Page);
  } else {
    hydrate(Page);
  }
};
