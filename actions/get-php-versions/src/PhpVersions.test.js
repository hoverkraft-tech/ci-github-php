import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, it } from "node:test";
import contracts from "./ComposerConstraints.json" with { type: "json" };
import { PhpVersions } from "./PhpVersions.js";

let workspace, project;
beforeEach(async () => {
  workspace = await mkdtemp(join(tmpdir(), "php-versions-"));
  project = join(workspace, "project");
  await mkdir(project);
  await writeFile(
    join(project, "composer.json"),
    JSON.stringify({ require: { php: "^8.2" } }),
  );
});
afterEach(async () => rm(workspace, { recursive: true, force: true }));

function catalog(versions = contracts.versions) {
  return async (url) => {
    const major = new URL(url).searchParams.get("version");
    const keys = major
      ? versions.filter((version) => version.startsWith(`${major}.`))
      : ["4", "5", "7", "8", "9", "metadata"];
    return Response.json(Object.fromEntries(keys.map((key) => [key, {}])));
  };
}

// Expected results were checked against Composer\Semver 3.6.0. Synthetic release
// catalogs keep this contract independent of newly published PHP versions.
for (const { constraint, expected } of contracts.cases) {
  it(`honors the Composer constraint: ${constraint}`, async () => {
    await writeFile(
      join(project, "composer.json"),
      JSON.stringify({ require: { php: constraint } }),
    );
    let requests = 0;
    const resolver = new PhpVersions({
      fetch: async (url) => {
        requests++;
        return catalog()(url);
      },
    });
    if (expected === null) {
      await assert.rejects(resolver.resolve(project, workspace));
      assert.equal(
        requests,
        0,
        "Reject invalid constraints before network access",
      );
    } else {
      assert.deepEqual(await resolver.resolve(project, workspace), {
        "php-versions": expected,
        "php-version": expected.at(-1),
      });
    }
  });
}

it("includes a new stable minor and excludes prereleases and PHP before 5.3", async () => {
  await writeFile(join(project, "composer.json"), '{"require":{"php":"*"}}');
  const versions = [
    "5.2.17",
    "5.3.0",
    "7.4.33",
    "8.5.1",
    "8.6.0",
    "8.7.0RC1",
    "9.0.0-dev",
  ];
  const resolver = new PhpVersions({ fetch: catalog(versions) });
  assert.deepEqual(
    (await resolver.resolve(project, workspace))["php-versions"],
    ["5.3.0", "7.4.33", "8.5.1", "8.6.0"],
  );
});

for (const manifest of [
  "{}",
  "null",
  '{"require":{"php":82}}',
  '{"require":{"php":" "}}',
  "{",
]) {
  it(`rejects an invalid manifest without network access: ${manifest}`, async () => {
    await writeFile(join(project, "composer.json"), manifest);
    const fetch = () => assert.fail("Must validate the manifest first");
    await assert.rejects(
      new PhpVersions({ fetch }).resolve(project, workspace),
    );
  });
}

it("rejects missing manifests", async () => {
  await assert.rejects(
    new PhpVersions().resolve(workspace, workspace),
    /composer.json/,
  );
});

it("rejects a missing project or a file used as a project directory", async () => {
  const resolver = new PhpVersions();
  await assert.rejects(resolver.resolve("missing", workspace), /ENOENT/);
  await assert.rejects(
    resolver.resolve("project/composer.json", workspace),
    /Project directory/,
  );
});

it("contains absolute, relative and symlink paths within the workspace", async () => {
  const resolver = new PhpVersions({ fetch: catalog() });
  await symlink(project, join(workspace, "inside"), "junction");
  const expected = await resolver.resolve(project, workspace);
  assert.deepEqual(await resolver.resolve("project", workspace), expected);
  assert.deepEqual(await resolver.resolve("inside", workspace), expected);
  await symlink(tmpdir(), join(workspace, "outside"), "junction");
  await assert.rejects(
    resolver.resolve("outside", workspace),
    /inside GITHUB_WORKSPACE/,
  );
  await assert.rejects(
    resolver.resolve("..", workspace),
    /inside GITHUB_WORKSPACE/,
  );
});

it("fails when no stable release matches", async () => {
  await writeFile(join(project, "composer.json"), '{"require":{"php":"^10"}}');
  await assert.rejects(
    new PhpVersions({ fetch: catalog() }).resolve(project, workspace),
    /No stable PHP release matches/,
  );
});

it("retries transient HTTP failures with bounded backoff and timeout", async () => {
  let calls = 0;
  const delays = [];
  const resolver = new PhpVersions({
    fetch: async (url, options) => {
      assert.ok(options.signal instanceof AbortSignal);
      assert.equal(options.headers["User-Agent"], "hoverkraft-php-versions");
      calls++;
      if (calls === 1) throw new Error("connection reset");
      if (calls === 2) return new Response("unavailable", { status: 503 });
      return catalog()(url);
    },
    sleep: async (delay) => delays.push(delay),
  });
  assert.equal(
    (await resolver.resolve(project, workspace))["php-version"],
    "8.5.0",
  );
  assert.deepEqual(delays, [500, 1000]);
});

it("stops after three failed requests", async () => {
  let calls = 0;
  const resolver = new PhpVersions({
    fetch: async () => {
      calls++;
      throw new Error("offline");
    },
    sleep: async () => {},
  });
  await assert.rejects(
    resolver.resolve(project, workspace),
    /Cannot retrieve the PHP release catalog/,
  );
  assert.equal(calls, 3);
});

for (const body of ["null", "[]", "{}", '"invalid"', "{"]) {
  it(`rejects a malformed release catalog: ${body}`, async () => {
    const resolver = new PhpVersions({ fetch: async () => new Response(body) });
    await assert.rejects(resolver.resolve(project, workspace));
  });
}
