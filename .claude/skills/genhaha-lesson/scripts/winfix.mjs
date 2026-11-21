// Windows only: `npx` is really npx.cmd, and Node refuses to start a .cmd file without a shell. Importing this file makes every
// spawnSync / execFileSync("npx", [...]) in the skill run through the shell (arguments with spaces are quoted). No effect on macOS / Linux.
import { createRequire, syncBuiltinESMExports } from "node:module";

if (process.platform === "win32") {
  const cp = createRequire(import.meta.url)("node:child_process");
  const quote = (a) => (/[\s"&|<>^]/.test(String(a)) ? `"${String(a).replace(/"/g, '\\"')}"` : String(a));
  for (const fn of ["spawnSync", "execFileSync"]) {
    const orig = cp[fn];
    cp[fn] = (cmd, args, opts) => (cmd === "npx" && Array.isArray(args) ? orig("npx", args.map(quote), { ...(opts || {}), shell: true }) : orig(cmd, args, opts));
  }
  syncBuiltinESMExports();
}
// genhaha:ed34a05c8342
