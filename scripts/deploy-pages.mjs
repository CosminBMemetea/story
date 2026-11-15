// Publishes the static demo to the `gh-pages` branch, which GitHub Pages
// serves at https://cosminbmemetea.github.io/story/.
// Usage: npm run deploy:pages  (needs push access to the repo's origin)
// The gh-pages branch only ever holds build output, so it is replaced on
// every deploy. Source branches such as main are never touched.
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = (cmd, cwd) => execSync(cmd, { stdio: "inherit", cwd });
const read = (cmd) => execSync(cmd).toString().trim();

run("node scripts/build-pages.mjs");
if (!existsSync("out/index.html"))
  throw new Error("out/index.html missing; build failed");

const remote = read("git remote get-url origin");
const sha = read("git rev-parse --short HEAD");
const dir = mkdtempSync(join(tmpdir(), "gh-pages-"));
try {
  cpSync("out", dir, { recursive: true });
  run("git init -q -b gh-pages", dir);
  run("git add -A", dir);
  run(`git commit -q -m "Deploy demo from ${sha}"`, dir);
  run(`git push -f "${remote}" gh-pages:gh-pages`, dir);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
console.log("Deployed. GitHub Pages will update in about a minute.");
