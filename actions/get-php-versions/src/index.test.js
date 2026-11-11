import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const entrypoint = process.env.ACTION_ENTRYPOINT
  ? pathToFileURL(process.env.ACTION_ENTRYPOINT)
  : new URL("./index.js", import.meta.url);
const { run, runCli } = await import(entrypoint);
let workspace;
beforeEach(async () => {
  workspace = await mkdtemp(join(tmpdir(), "php-action-"));
  await writeFile(
    join(workspace, "composer.json"),
    '{"require":{"php":"~8.2.0"}}',
  );
});
afterEach(async () => rm(workspace, { recursive: true, force: true }));

it("publishes both outputs from the real resolver using the default directory", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) =>
    Response.json(
      url.includes("&version=")
        ? { "8.2.1": {}, "8.2.10": {}, "8.3.0": {} }
        : { 8: {} },
    ),
  );
  const outputs = {};
  await run({
    workspace,
    core: {
      getInput: (name) => {
        assert.equal(name, "working-directory");
        return "";
      },
      setOutput: (name, value) => {
        outputs[name] = value;
      },
      setFailed: assert.fail,
    },
  });
  assert.deepEqual(outputs, {
    "php-versions": ["8.2.10"],
    "php-version": "8.2.10",
  });
});

it("fails with no outputs when the input is outside the workspace", async () => {
  const failures = [];
  await run({
    workspace,
    core: {
      getInput: () => "..",
      setOutput: assert.fail,
      setFailed: (message) => failures.push(message),
    },
  });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /inside GITHUB_WORKSPACE/);
});

it("preserves the local JSON and highest-version CLI interfaces", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) =>
    Response.json(url.includes("&version=") ? { "8.2.10": {} } : { 8: {} }),
  );
  const output = [];
  const stdout = { write: (value) => output.push(value) };
  await runCli({ args: [workspace], workspace, stdout });
  await runCli({ args: [workspace, "--latest"], workspace, stdout });
  assert.deepEqual(JSON.parse(output[0]), {
    "php-versions": ["8.2.10"],
    "php-version": "8.2.10",
  });
  assert.equal(output[1], "8.2.10\n");
  for (const args of [
    [],
    [workspace, "--unknown"],
    [workspace, "--latest", "extra"],
  ]) {
    await assert.rejects(runCli({ args, workspace, stdout }), /Usage:/);
  }
});

it("executes the native action entry point and reports failures through core", async () => {
  const output = join(workspace, "outputs");
  await writeFile(output, "");
  const result = spawnSync(process.execPath, [fileURLToPath(entrypoint)], {
    env: {
      ...process.env,
      GITHUB_WORKSPACE: workspace,
      GITHUB_OUTPUT: output,
      "INPUT_WORKING-DIRECTORY": "..",
    },
    encoding: "utf8",
  });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /::error::.*inside GITHUB_WORKSPACE/);
  assert.equal(await readFile(output, "utf8"), "");
});

it("executes the CLI entry point and rejects invalid arguments", () => {
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(entrypoint), workspace, "--unknown"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage:/);
  assert.equal(result.stdout, "");
});
