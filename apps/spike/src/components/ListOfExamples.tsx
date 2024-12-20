import fs from "node:fs";

import type { FC } from "react";

function getPages(): string[] {
  return fs
    .readdirSync(process.cwd() + "/src")
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => file.replace(/\.tsx$/, ""));
}

export const ListOfExamples: FC = () => {
  return (
    <ul>
      {getPages().map((name) => (
        <li key={name}>
          <a href={`/${name}`}>{name}</a>
        </li>
      ))}
    </ul>
  );
};
