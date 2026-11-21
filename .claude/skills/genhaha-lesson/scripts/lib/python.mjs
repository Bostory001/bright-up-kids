// Finds a Python that can `import edge_tts`, without touching the user's global packages.
//   1. $LS_PYTHON (a python executable)          2. python3 / python with edge_tts installed
//   3. uv (`uv run --with edge-tts python`, cached, nothing installed globally)
import { spawnSync } from "node:child_process";
import { which } from "./common.mjs";

let cached;
export function edgePython() {
  if (cached !== undefined) return cached;
  const ok = (cmd, pre = []) => spawnSync(cmd, [...pre, "-c", "import edge_tts"], { stdio: "ignore" }).status === 0;
  for (const py of [process.env.LS_PYTHON, "python3", "python"].filter(Boolean)) {
    if ((py.includes("/") || which(py)) && ok(py)) return (cached = { cmd: py, pre: [], how: `${py} (edge_tts installed)` });
  }
  if (which("uv")) {
    const pre = ["run", "--quiet", "--no-project", "--with", "edge-tts", "python"];
    if (ok("uv", pre)) return (cached = { cmd: "uv", pre, how: "uv run --with edge-tts (cached env)" });
  }
  return (cached = null);
}
export const EDGE_HINT = "install edge-tts (free): `python3 -m pip install --user edge-tts`, or a venv with edge-tts and LS_PYTHON=<venv>/bin/python, or install uv (https://docs.astral.sh/uv/) and the scripts use `uv run --with edge-tts` by themselves";
// genhaha:ed34a05c8342
