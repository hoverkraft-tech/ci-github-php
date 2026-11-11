import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as actionsCore from "@actions/core";
import { PhpVersions } from "./PhpVersions.js";

export async function run({
  core = actionsCore,
  resolver = new PhpVersions(),
  workspace = process.env.GITHUB_WORKSPACE,
} = {}) {
  try {
    const versions = await resolver.resolve(
      core.getInput("working-directory") || ".",
      workspace,
    );
    for (const [name, value] of Object.entries(versions))
      core.setOutput(name, value);
  } catch (error) {
    core.setFailed(error.message);
  }
}

export async function runCli({
  args,
  resolver = new PhpVersions(),
  workspace = process.env.GITHUB_WORKSPACE,
  stdout = process.stdout,
} = {}) {
  if (
    args.length < 1 ||
    args.length > 2 ||
    (args.length === 2 && args[1] !== "--latest")
  ) {
    throw new Error("Usage: node dist/index.js PROJECT_DIRECTORY [--latest]");
  }
  const versions = await resolver.resolve(args[0], workspace);
  stdout.write(
    `${args[1] === "--latest" ? versions["php-version"] : JSON.stringify(versions)}\n`,
  );
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  if (process.argv.length === 2) {
    await run();
  } else {
    try {
      await runCli({ args: process.argv.slice(2) });
    } catch (error) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    }
  }
}
