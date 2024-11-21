import fs from "node:fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Html } from "./components/Html";

function getPages(): string[] {
  return fs
    .readdirSync(dirname(fileURLToPath(import.meta.url)))
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => file.replace(/\.tsx$/, ""));
}

export default function Page() {
  const pages = getPages();

  return (
    <Html title="Overview">
      <ul>
        {pages.map((name) => (
          <li key={name}>
            <a href={`/${name}`}>{name}</a>
          </li>
        ))}
      </ul>
    </Html>
  );
}
