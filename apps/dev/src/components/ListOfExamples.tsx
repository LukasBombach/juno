import fs from "node:fs";

import type { FC } from "react";

function getPages(): [string, string][] {
  return fs
    .readdirSync(process.cwd() + "/src")
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => [file.replace(/\.tsx$/, ""), file.replace(/_/g, " ").replace(/\.tsx$/, "")]);
}

export const ListOfExamples: FC = () => {
  return (
    <ul>
      {getPages().map(([path, name]) => (
        <li key={path}>
          <a href={`/${path}`}>{name}</a>
        </li>
      ))}
    </ul>
  );
};
