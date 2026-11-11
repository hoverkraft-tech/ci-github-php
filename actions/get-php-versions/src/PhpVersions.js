import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { setTimeout } from "node:timers/promises";
import { parseConstraint, parseVersion } from "composer-semver";

const RELEASES_URL = "https://www.php.net/releases/index.php?json";

export class PhpVersions {
  constructor({ fetch = globalThis.fetch, sleep = setTimeout } = {}) {
    this.fetch = fetch;
    this.sleep = sleep;
  }

  async resolve(directory, workspace = process.env.GITHUB_WORKSPACE) {
    const project = await this.projectDirectory(directory, workspace);
    const manifest = JSON.parse(
      await readFile(join(project, "composer.json"), "utf8"),
    );
    const constraint = manifest?.require?.php;
    if (typeof constraint !== "string" || constraint.trim() === "") {
      throw new Error(
        "Declare require.php in composer.json or select PHP explicitly.",
      );
    }
    // Validate before fetching the catalog. Do not approximate Composer ranges.
    // FIXME: Upgrade to a stable release containing shyim/composer-semver-ts#1.
    // The Composer contract tests must pass before this migration can be merged.
    const parsed = parseConstraint(constraint);
    const releases = await this.releases();
    const matches = releases
      .filter((version) => parsed.check(parseVersion(version)))
      .sort((left, right) => parseVersion(left).compare(parseVersion(right)));
    const minors = new Map();
    for (const version of matches) {
      minors.set(version.slice(0, version.lastIndexOf(".")), version);
    }
    const versions = [...minors.values()];
    if (versions.length === 0) {
      throw new Error(
        `No stable PHP release matches require.php: ${constraint}`,
      );
    }
    return { "php-versions": versions, "php-version": versions.at(-1) };
  }

  async projectDirectory(directory, workspace) {
    const project = await realpath(
      resolve(workspace || process.cwd(), directory),
    );
    if (!(await stat(project)).isDirectory()) {
      throw new Error(`Project directory does not exist: ${directory}`);
    }
    if (workspace) {
      const path = relative(await realpath(workspace), project);
      if (path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path)) {
        throw new Error("Project directory must be inside GITHUB_WORKSPACE.");
      }
    }
    return project;
  }

  async releases() {
    const majors = Object.keys(await this.catalog(RELEASES_URL));
    const releases = [];
    for (const major of majors) {
      if (!/^\d+$/.test(major) || Number(major) < 5) continue;
      const catalog = await this.catalog(
        `${RELEASES_URL}&version=${major}&max=1000`,
      );
      for (const version of Object.keys(catalog)) {
        if (
          /^\d+\.\d+\.\d+$/.test(version) &&
          parseVersion(version).greaterThanOrEqual(parseVersion("5.3.0"))
        ) {
          releases.push(version);
        }
      }
    }
    return releases;
  }

  async catalog(url) {
    for (let attempt = 0; attempt < 3; attempt++) {
      let response;
      try {
        response = await this.fetch(url, {
          signal: AbortSignal.timeout(20_000),
          headers: { "User-Agent": "hoverkraft-php-versions" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        if (attempt === 2) {
          throw new Error(`Cannot retrieve the PHP release catalog: ${url}`, {
            cause: error,
          });
        }
        await this.sleep(500 * (attempt + 1));
        continue;
      }
      const data = await response.json();
      if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data) ||
        Object.keys(data).length === 0
      ) {
        throw new Error(`Invalid PHP release catalog: ${url}`);
      }
      return data;
    }
  }
}
