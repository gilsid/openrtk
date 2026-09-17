import type { Plugin } from "@opencode/plugin"
import { execFile } from "node:child_process"
import { rewrite } from "./rewrite.js"

/** True when the `rtk` binary is installed and runs. */
function rtkInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    execFile("rtk", ["--version"], (error) => resolve(!error))
  })
}

async function setup(ctx: Plugin.Context): Promise<void> {
  if (!(await rtkInstalled())) {
    console.warn("[openrtk] rtk binary not found in PATH, plugin disabled")
    return
  }

  await ctx.shell.hook("create.before", (event) => {
    const rewritten = rewrite(event.command)
    if (rewritten) event.command = rewritten
  })
}

interface V1Shell {
  (strings: TemplateStringsArray, ...values: unknown[]): { quiet(): Promise<unknown> }
}

interface V1BeforeInput {
  tool?: string
}

interface V1BeforeOutput {
  args?: Record<string, unknown>
}

export const rtkPlugin = async ({ $ }: { $: V1Shell }) => {
  try {
    await $`which rtk`.quiet()
  } catch {
    console.warn("[openrtk] rtk binary not found in PATH, plugin disabled")
    return {}
  }

  return {
    "tool.execute.before": async (input: V1BeforeInput, output: V1BeforeOutput) => {
      const tool = String(input?.tool ?? "").toLowerCase()
      if (tool !== "bash" && tool !== "shell") return

      const args = output?.args
      if (!args || typeof args !== "object") return

      const rewritten = rewrite(args.command)
      if (rewritten) args.command = rewritten
    },
  }
}

const v2 = {
  id: "openrtk",
  setup,
} satisfies Plugin.Plugin

export default {
  ...v2,

  // Entry point for OpenCode 1. Version 2 ignores it and uses id/setup above.
  server: rtkPlugin,
}
