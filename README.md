# openrtk

OpenCode plugin for [RTK](https://github.com/rtk-ai/rtk) (Rust Token Killer). Reduces LLM token consumption by 60-90% on common dev commands by transparently routing them through RTK's output compression.

A lightweight OpenCode plugin that intercepts shell commands and pipes them through RTK for automatic output compression. The model sees full output while RTK handles token reduction behind the scenes — no changes needed to prompts or workflow.

## Prerequisites

Install RTK (note: `cargo install rtk` installs an unrelated crate):

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

## Installation

No npm release needed. Copy `src/index.ts` and `src/rewrite.ts` into a plugin
directory:

- `~/.config/opencode/plugins/` to cover every project
- `.opencode/plugins/` to cover one project

then restart OpenCode. If `"openrtk"` sits in the `plugin` array in
`opencode.json`, remove it, or the old npm release loads next to the
local copy and every command gets rewritten twice.

To refresh the installed copy after editing the source, run
`bun run bundle` and copy `dist/openrtk.js` over the file in the
plugin directory. The bundle step matters because OpenCode loads each
file in that directory as its own plugin, so the two source files must
ship as one.

## How it works

The plugin hooks into OpenCode's shell handling and rewrites commands to go through RTK before execution. On OpenCode 2 it uses the `shell create.before` hook; on OpenCode 1 it falls back to `tool.execute.before`. This is fully transparent to the model.

```
git status       ->  rtk git status       (72% savings)
cargo test       ->  rtk cargo test       (80% savings)
docker ps        ->  rtk docker ps        (65% savings)
```

### Supported commands

| Category | Commands |
|----------|----------|
| Git | status, diff, log, add, commit, push, pull, branch, fetch, stash, show |
| GitHub CLI | pr, issue, run, api, release |
| Rust | cargo test/build/clippy/check/install/fmt |
| File ops | cat, grep, rg, ls, tree, find, diff |
| JS/TS | vitest, npm test/run, tsc, eslint, prettier, playwright, prisma |
| Containers | docker (compose/ps/images/logs/run/build/exec), kubectl (get/logs/describe/apply) |
| Network | curl, wget |
| Python | pytest, ruff, pip, uv pip |
| Go | go test/build/vet, golangci-lint |
| Elixir | mix (test/compile/credo/format/dialyzer/ecto), iex |
| Packages | pnpm list/ls/outdated |

### System prompt

Copy `opencode.md` into your project or user config to teach the model about `rtk gain` and other meta commands.

## Development

```bash
npm run build     # build the plugin
npm test          # run tests
```

## License

MIT
