import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createServer as createViteServer } from "vite";
import chalk from "chalk";
import cliCursor from "cli-cursor";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  // When the server restarts (for example after the user modifies
  // vite.config.js), `vite.middlewares` is still going to be the same
  // reference (with a new internal stack of Vite and plugin-injected
  // middlewares). The following is valid even after restarts.
  app.use(vite.middlewares);

  app.use("*", async (_req, res) => {
    res.send("Hello world!").end();
  });

  app.listen(3000);
}

cliCursor.hide();

await createServer();

console.info("");
console.info(chalk.hex("#FF8800").bold("  hello juno"));
console.info("");
console.info(chalk.bold.dim("› server started at"), chalk.bold("http://localhost:3000/"));
console.info("");
