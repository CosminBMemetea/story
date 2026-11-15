// Builds the static GitHub Pages export.
// API route handlers cannot be statically exported, so app/api is moved
// aside for the duration of the build and always restored afterwards.
import { execSync } from "node:child_process";
import { existsSync, renameSync, writeFileSync } from "node:fs";

const api = "app/api";
const parked = ".api-parked";

if (existsSync(api)) renameSync(api, parked);
try {
  execSync("next build", {
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "true" },
  });
  writeFileSync("out/.nojekyll", "");
} finally {
  if (existsSync(parked)) renameSync(parked, api);
}
