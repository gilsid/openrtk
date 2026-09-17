import { describe, expect, test } from "bun:test"
import pluginDefault, { rtkPlugin } from "./index.js"
import { rewrite } from "./rewrite.js"

describe("rewrite", () => {
  describe("git commands", () => {
    test("rewrites git status", () => {
      expect(rewrite("git status")).toBe("rtk git status")
    })

    test("rewrites git status with flags", () => {
      expect(rewrite("git status -s")).toBe("rtk git status -s")
    })

    test("rewrites git diff", () => {
      expect(rewrite("git diff")).toBe("rtk git diff")
    })

    test("rewrites git log", () => {
      expect(rewrite("git log --oneline -10")).toBe("rtk git log --oneline -10")
    })

    test("rewrites git push", () => {
      expect(rewrite("git push origin main")).toBe("rtk git push origin main")
    })

    test("rewrites git commit", () => {
      expect(rewrite('git commit -m "fix"')).toBe('rtk git commit -m "fix"')
    })

    test("rewrites git branch", () => {
      expect(rewrite("git branch -a")).toBe("rtk git branch -a")
    })

    test("rewrites git fetch", () => {
      expect(rewrite("git fetch --all")).toBe("rtk git fetch --all")
    })

    test("rewrites git stash", () => {
      expect(rewrite("git stash pop")).toBe("rtk git stash pop")
    })

    test("rewrites git show", () => {
      expect(rewrite("git show HEAD")).toBe("rtk git show HEAD")
    })
  })

  describe("github cli", () => {
    test("rewrites gh pr", () => {
      expect(rewrite("gh pr list")).toBe("rtk gh pr list")
    })

    test("rewrites gh issue", () => {
      expect(rewrite("gh issue view 123")).toBe("rtk gh issue view 123")
    })

    test("rewrites gh run", () => {
      expect(rewrite("gh run list")).toBe("rtk gh run list")
    })

    test("does not rewrite gh auth", () => {
      expect(rewrite("gh auth login")).toBeNull()
    })
  })

  describe("cargo commands", () => {
    test("rewrites cargo test", () => {
      expect(rewrite("cargo test")).toBe("rtk cargo test")
    })

    test("rewrites cargo build", () => {
      expect(rewrite("cargo build --release")).toBe("rtk cargo build --release")
    })

    test("rewrites cargo clippy", () => {
      expect(rewrite("cargo clippy")).toBe("rtk cargo clippy")
    })
  })

  describe("file operations", () => {
    test("rewrites cat to rtk read", () => {
      expect(rewrite("cat README.md")).toBe("rtk read README.md")
    })

    test("rewrites grep", () => {
      expect(rewrite("grep -r TODO src/")).toBe("rtk grep -r TODO src/")
    })

    test("rewrites rg", () => {
      expect(rewrite("rg pattern")).toBe("rtk rg pattern")
    })

    test("rewrites ls", () => {
      expect(rewrite("ls -la")).toBe("rtk ls -la")
    })

    test("rewrites tree", () => {
      expect(rewrite("tree src/")).toBe("rtk tree src/")
    })

    test("rewrites find", () => {
      expect(rewrite("find . -name '*.ts'")).toBe("rtk find . -name '*.ts'")
    })
  })

  describe("js/ts tooling", () => {
    test("rewrites vitest", () => {
      expect(rewrite("vitest run")).toBe("rtk vitest run")
    })

    test("rewrites npx vitest", () => {
      expect(rewrite("npx vitest")).toBe("rtk vitest run")
    })

    test("rewrites npm test", () => {
      expect(rewrite("npm test")).toBe("rtk npm test")
    })

    test("rewrites npm run", () => {
      expect(rewrite("npm run build")).toBe("rtk npm build")
    })

    test("rewrites tsc", () => {
      expect(rewrite("tsc --noEmit")).toBe("rtk tsc --noEmit")
    })

    test("rewrites eslint", () => {
      expect(rewrite("eslint src/")).toBe("rtk lint src/")
    })

    test("rewrites playwright", () => {
      expect(rewrite("npx playwright test")).toBe("rtk playwright test")
    })
  })

  describe("containers", () => {
    test("rewrites docker compose", () => {
      expect(rewrite("docker compose up")).toBe("rtk docker compose up")
    })

    test("rewrites docker ps", () => {
      expect(rewrite("docker ps")).toBe("rtk docker ps")
    })

    test("rewrites kubectl get", () => {
      expect(rewrite("kubectl get pods")).toBe("rtk kubectl get pods")
    })
  })

  describe("python", () => {
    test("rewrites pytest", () => {
      expect(rewrite("pytest tests/")).toBe("rtk pytest tests/")
    })

    test("rewrites python -m pytest", () => {
      expect(rewrite("python -m pytest")).toBe("rtk pytest")
    })

    test("rewrites ruff check", () => {
      expect(rewrite("ruff check .")).toBe("rtk ruff check .")
    })
  })

  describe("go", () => {
    test("rewrites go test", () => {
      expect(rewrite("go test ./...")).toBe("rtk go test ./...")
    })

    test("rewrites go build", () => {
      expect(rewrite("go build")).toBe("rtk go build")
    })
  })

  describe("elixir / phoenix / ash", () => {
    test("rewrites mix phx.routes", () => {
      expect(rewrite("mix phx.routes")).toBe("rtk --cache mix phx.routes")
    })

    test("rewrites mix ash.info", () => {
      expect(rewrite("mix ash.info MyResource")).toBe("rtk --cache mix ash.info MyResource")
    })

    test("rewrites mix test", () => {
      expect(rewrite("mix test")).toBe("rtk test mix test")
    })

    test("rewrites mix compile", () => {
      expect(rewrite("mix compile")).toBe("rtk mix compile")
    })

    test("rewrites mix ecto.migrate", () => {
      expect(rewrite("mix ecto.migrate")).toBe("rtk mix ecto.migrate")
    })

    test("rewrites mix ecto.migrations", () => {
      expect(rewrite("mix ecto.migrations")).toBe("rtk mix ecto.migrations")
    })

    test("rewrites generic mix commands", () => {
      expect(rewrite("mix deps.get")).toBe("rtk mix deps.get")
    })

    test("rewrites iex sessions", () => {
      expect(rewrite("iex -S mix")).toBe("rtk iex -S mix")
    })

    test("rewrites mix help", () => {
      expect(rewrite("mix help phx.gen.html")).toBe("rtk --cache mix help phx.gen.html")
    })
  })

  describe("compound commands", () => {
    test("rewrites each && segment", () => {
      expect(rewrite("git status && git diff")).toBe("rtk git status && rtk git diff")
    })

    test("leaves unsupported segments untouched", () => {
      expect(rewrite("git stash && nix flake check && git stash pop")).toBe(
        "rtk git stash && nix flake check && rtk git stash pop",
      )
    })

    test("supports ||, ; and pipes", () => {
      expect(rewrite("git fetch || git pull; ls | grep foo")).toBe(
        "rtk git fetch || rtk git pull; rtk ls | rtk grep foo",
      )
    })

    test("does not split quoted separators", () => {
      expect(rewrite('git commit -m "a && b"')).toBe('rtk git commit -m "a && b"')
    })

    test("honors backslash-escaped quotes", () => {
      expect(rewrite('git commit -m "a \\" && b" && git status')).toBe(
        'rtk git commit -m "a \\" && b" && rtk git status',
      )
    })

    test("rewrites env-prefixed segments", () => {
      expect(rewrite("CI=true cargo test && git status")).toBe("CI=true rtk cargo test && rtk git status")
    })

    test("only skips the heredoc segment", () => {
      expect(rewrite("git status && cat <<EOF")).toBe("rtk git status && cat <<EOF")
    })

    test("skips segments already using rtk", () => {
      expect(rewrite("rtk git status && git diff")).toBe("rtk git status && rtk git diff")
    })

    test("returns null when no segment matches", () => {
      expect(rewrite("echo hello && echo world")).toBeNull()
    })
  })

  describe("skip conditions", () => {
    test("skips commands already using rtk", () => {
      expect(rewrite("rtk git status")).toBeNull()
    })

    test("skips commands with heredocs", () => {
      expect(rewrite("cat <<EOF\nhello\nEOF")).toBeNull()
    })

    test("skips unrecognized commands", () => {
      expect(rewrite("echo hello")).toBeNull()
    })
  })

  describe("env prefix handling", () => {
    test("preserves env vars and rewrites command", () => {
      expect(rewrite("CI=true cargo test")).toBe("CI=true rtk cargo test")
    })

    test("preserves multiple env vars", () => {
      expect(rewrite("FOO=1 BAR=2 git status")).toBe("FOO=1 BAR=2 rtk git status")
    })
  })
})

describe("plugin entry points", () => {
  test("default export carries the openrtk id with v1 and v2 hooks", () => {
    expect(pluginDefault.id).toBe("openrtk")
    expect(typeof pluginDefault.setup).toBe("function")
    expect(typeof pluginDefault.server).toBe("function")
  })

  test("v2 setup rewrites shell commands", async () => {
    let handler: ((event: { command: string }) => void) | undefined
    await pluginDefault.setup({
      shell: {
        hook: async (_name: string, cb: (event: { command: string }) => void) => {
          handler = cb
        },
      },
    } as never)

    const event = { command: "git status && git diff" }
    await handler!(event)
    expect(event.command).toBe("rtk git status && rtk git diff")
  })

  test("v2 setup leaves unknown commands alone", async () => {
    let handler: ((event: { command: string }) => void) | undefined
    await pluginDefault.setup({
      shell: {
        hook: async (_name: string, cb: (event: { command: string }) => void) => {
          handler = cb
        },
      },
    } as never)

    const event = { command: "echo hello" }
    await handler!(event)
    expect(event.command).toBe("echo hello")
  })

  test("v2 setup stays quiet without the rtk binary", async () => {
    const path = process.env.PATH
    process.env.PATH = "/nonexistent"
    try {
      let registered = false
      await pluginDefault.setup({
        shell: {
          hook: async () => {
            registered = true
          },
        },
      } as never)
      expect(registered).toBe(false)
    } finally {
      process.env.PATH = path
    }
  })

  test("v1 server rewrites bash tool commands", async () => {
    const fakeShell = () => ({ quiet: async () => {} })
    const hooks = (await rtkPlugin({ $: fakeShell as never })) as Record<
      string,
      (input: unknown, output: { args: Record<string, unknown> }) => Promise<void>
    >

    const output = { args: { command: "git status" } }
    await hooks["tool.execute.before"]({ tool: "bash" }, output)
    expect(output.args.command).toBe("rtk git status")
  })

  test("v1 server ignores other tools", async () => {
    const fakeShell = () => ({ quiet: async () => {} })
    const hooks = (await rtkPlugin({ $: fakeShell as never })) as Record<
      string,
      (input: unknown, output: { args: Record<string, unknown> }) => Promise<void>
    >

    const output = { args: { command: "git status" } }
    await hooks["tool.execute.before"]({ tool: "read" }, output)
    expect(output.args.command).toBe("git status")
  })
})
