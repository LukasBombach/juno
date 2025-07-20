import { Editor } from "../components/Editor";

const sourcepoint_script = "https://consent.t-online.de/unified/wrapperMessagingWithoutDetection.js";

function Home() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width" />
        <title>juno</title>
        <script inline src="../consent/tcf_api.ts" />
        <script inline src="../consent/sourcepoint_config.ts" />
        <script async src={sourcepoint_script} />
        <script defer src="./home.client.ts" />
      </head>
      <body className="h-screen bg-purple text-white grid grid-cols-12 grid-rows-12">
        <div className="row-start-2 -row-end-2 col-start-2 -col-end-2 rounded-xl shadow-window p-4 bg-white text-zinc-950 text-sm font-mono">
          <Editor />
        </div>
      </body>
    </html>
  );
}
