<!-- header:start -->

# GitHub Reusable Workflow: Continuous integration

<!-- header:end -->
<!-- overview:start -->

## Overview

Use `continuous-integration.yml` from both your pull request and default-branch
workflows. Pin the same reviewed commit in each caller. An application can use
lint and tests without enabling Composer package publication.

```yaml
permissions: {}
jobs:
  checks:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@<commit-sha>
    permissions:
      contents: read
```

Define `lint:ci` and `test:ci` in `composer.json`. These are explicit project commands;
they execute even when dependency installation scripts are disabled. An empty
`lint` or `test` input disables that job; `test: "false"` also disables tests. Missing named scripts fail the job. `lint` also accepts a JSON object such as
`lint: '{"command":"lint:custom"}'`, or `"false"` to skip linting.

Use `runs-on` for a JSON array of Linux runner labels, for example
`runs-on: '["self-hosted", "linux"]'`. Every job uses those labels.
Docker must be available for the PHP version discovery action.
Set `checks: false` to skip lint, tests, dependency review and distribution checks.

### Runtime and dependencies

With no `php-versions` input, CI reads `composer.json`'s `require.php` and
discovers released stable versions from PHP.net using Composer's constraint parser.
Discovery runs in its own container without changing the runner's PHP installation.
It tests the newest compatible patch of every matching minor, including end-of-life
versions still allowed by the project. Prereleases are excluded. Missing or invalid
constraints and release-catalog failures stop discovery instead of choosing an arbitrary runtime.
The highest discovered version runs lint and package checks and contributes coverage.
Set `php-versions` explicitly to override the matrix, for example `'["8.2", "8.5"]'`.
The last explicit entry is primary; an empty entry delegates to the setup action,
which honors `.php-version` and Composer platform overrides before automatic discovery.
See [PHP version selection](../../actions/get-php-versions/README.md#local-docker-builds) for local Docker builds.

Composer projects with or without a committed lockfile are supported. Each
project is installed independently. By default, setup installs the root manifest
and `tools/composer.json` when it exists. It does not search nested directories.
Use `composer-directories` to override discovery, for example `["."]` for the root
only or `[".", "dev-tools"]` for another tooling directory. Only Composer's download cache is shared between
runs; dependencies are installed and platform requirements checked each time.

Installation scripts and plugins are disabled by default. Use
`ignore-scripts: false` when installation hooks are required. Use
`ignore-plugins: false` for a project with explicit Composer `allow-plugins`
configuration, such as PHPStan's extension installer. These options affect
installation, not explicit lint or test commands.

For custom jobs, call `actions/setup-php` after checkout, then the individual
lint or test actions. `install-dependencies: false` prepares the runtime
without installing the project, for example before isolated package checks.

### Reports and coverage

Lint and test jobs retain native diagnostics in one artifact per execution.
They post no PR comments and need no publication permissions. Configure native
test reports (JUnit or TAP) and lint reports (for example Checkstyle or SARIF).
Missing required reports fail even when the tool command exits successfully.
Available reports are retained after failures.

Tests require Cobertura by default. The highest configured runtime contributes
coverage; every runtime retains its test results. Set `test: '{"coverage":false}'`
for tests that deliberately produce no Cobertura. The command still controls
instrumentation. Custom `test.coverage-reports` describes Cobertura file paths,
Linguist languages and stable component labels; it belongs beside the producer.
Separate components stay separate. Merge shards in the framework first.

Call the common workflow once after producer workflows. It reads their complete
report plans from `needs`, regardless of calling job names:

```yaml
reports:
  needs: [checks]
  if: ${{ always() }}
  uses: hoverkraft-tech/ci-github-common/.github/workflows/ci-reports.yml@<commit-sha>
  permissions:
    contents: read
    pull-requests: write
    code-quality: write
    id-token: write
  with:
    job-results: ${{ toJSON(needs) }}
    coverage: github
```

Select `coverage: none` (default) for summaries, `github` for native GitHub
coverage, or `codecov`. Both publishers consume validated Cobertura. Native
GitHub coverage requires repository enablement and a default-branch baseline.
The reporting workflow owns one CI comment and the `CI reports complete` check.
Forks retain diagnostics without write operations. Partial reruns require
rerunning all producers. Producer workflows test the PR head or push revision.

Standalone action jobs forward their `report-plan` output. Custom outer matrices
must forward a complete plan derived from their configuration; GitHub's last
successful matrix output does not describe all executions. See the common
[recording action](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/quality/record-ci-reports)
for the advanced contract. No collector-side coverage inventory is needed.

### Generated application files and documentation

Projects needing asset compilation or generated code keep those steps in their
Composer commands or dedicated caller jobs. PHP libraries need no generic build
step; Composer distributes committed source selected by Git export rules.

For API documentation, use `documentation.yml`, with optional `runs-on` labels
for a Linux runner supporting Docker. It uses the project's phpDocumentor
configuration when present, otherwise `src/`, and uploads a site containing
`phpdoc/`. Run it during pull request validation and restore its `artifact-id` into
`_site` for a separate deployment job using `ci-github-publish` actions. Site
publishing and project-specific documentation transformations remain in the caller.

### Package checks

Set `package: "true"` for a public Composer package at the Git repository root. The
test action snapshots the checked-out commit using `git archive`, respecting
`.gitattributes` `export-ignore` and `export-subst`. Uncommitted files and generated
build output are not included.

The test action validates `composer.json`, verifies declared PSR autoload paths,
autoload files, and binaries, installs the archive in an isolated consumer with
production dependencies, checks platform requirements, and loads the autoloader.
Installation hooks and plugins remain disabled in that consumer.

Distribution testing is disabled by default. Omit `package` or pass `"false"` to skip it.
The input is a string, so boolean values must be quoted. A JSON object enables
distribution testing with specific options; unknown options and non-string `tests` fail
configuration validation.

Use `tests` only for behavior specific to your package, such as rendering a
template or invoking a CLI:

```yaml
with:
  package: '{"tests":"my-cli --help"}'
```

Commands execute in the consumer, with `vendor/bin`
on `PATH` and `PACKAGE_NAME`, `PACKAGE_INSTALL_PATH`, and `PACKAGE_ARCHIVE_PATH`
available. The temporary consumer is removed after success or failure. Modifying
the temporary source archive fails validation. Nothing is uploaded: this tests
the files GitHub will distribute, without adding a package publication step.

Package checks run on the primary PHP version. The source test matrix remains
responsible for compatibility across every supported PHP version. Release callers should depend on successful validation with `needs`.

### Permissions

- **`contents`**: `read`

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
name: Continuous integration
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  continuous-integration:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@f8d7617370279021ecf35ff6fe4e3a72598bc34b # feat/native-github-coverage
    permissions:
      contents: read
    with:
      # JSON array of Linux runner labels. Applies to every job, including the configuration job.
      # Default: `["ubuntu-latest"]`
      runs-on: '["ubuntu-latest"]'

      # Enable lint, tests, dependency review and optional distribution checks.
      # Default: `true`
      checks: true

      # Composer project directory relative to the checkout.
      # Default: `.`
      working-directory: .

      # Optional JSON array overriding Composer-based PHP discovery. Empty discovers the newest stable compatible patch per minor. The last version runs lint/package checks and contributes coverage. An empty entry uses the setup action default.
      php-versions: ""

      # PHP extensions forwarded to setup-php.
      # Default: `mbstring, dom, xml, xmlwriter, curl, zip, intl`
      extensions: mbstring, dom, xml, xmlwriter, curl, zip, intl

      # Optional JSON array of Composer directories relative to working-directory. Empty installs the root project and tools/composer.json when present, without recursive discovery.
      composer-directories: ""

      # Disable Composer installation scripts. Explicit project commands still run.
      # Default: `true`
      ignore-scripts: true

      # Disable Composer plugins during installation. When false, Composer allow-plugins configuration still applies.
      # Default: `true`
      ignore-plugins: true

      # Composer lint script name or a JSON object with `command` (default `lint:ci`). Pass "false", "null" or an empty string to disable.
      # Default: `true`
      lint: "true"

      # true for defaults, a Composer script, or JSON options (command, coverage boolean, coverage-reports array, cache). false, null or empty disables tests. Only the primary runtime contributes coverage.
      # Default: `true`
      test: "true"

      # Validate a public Composer source distribution from the Git repository root.
      # Pass "false" (the default) to disable, "true" for archive and autoload checks,
      # or a JSON object with `tests` for additional commands in an isolated Composer consumer.
      # Quote booleans because this input has type string. Example: `{"tests":"my-cli --help"}`.
      # vendor/bin is on PATH; PACKAGE_NAME, PACKAGE_INSTALL_PATH and PACKAGE_ARCHIVE_PATH identify the package.
      # Unknown options and non-string tests are rejected before distribution checks.
      #
      # Default: `false`
      package: "false"

      # Review dependency changes on pull requests.
      # Default: `true`
      dependency-review: true

      # Expected producer metadata supplied by reusable workflows. Leave empty for standalone use.
      report-plan: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**                  | **Description**                                                                                                                                                                                                                              | **Required** | **Type**    | **Default**                                      |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- | ------------------------------------------------ |
| **`runs-on`**              | JSON array of Linux runner labels. Applies to every job, including the configuration job.                                                                                                                                                    | **false**    | **string**  | `["ubuntu-latest"]`                              |
| **`checks`**               | Enable lint, tests, dependency review and optional distribution checks.                                                                                                                                                                      | **false**    | **boolean** | `true`                                           |
| **`working-directory`**    | Composer project directory relative to the checkout.                                                                                                                                                                                         | **false**    | **string**  | `.`                                              |
| **`php-versions`**         | Optional JSON array overriding Composer-based PHP discovery. Empty discovers the newest stable compatible patch per minor. The last version runs lint/package checks and contributes coverage. An empty entry uses the setup action default. | **false**    | **string**  | -                                                |
| **`extensions`**           | PHP extensions forwarded to setup-php.                                                                                                                                                                                                       | **false**    | **string**  | `mbstring, dom, xml, xmlwriter, curl, zip, intl` |
| **`composer-directories`** | Optional JSON array of Composer directories relative to working-directory. Empty installs the root project and tools/composer.json when present, without recursive discovery.                                                                | **false**    | **string**  | -                                                |
| **`ignore-scripts`**       | Disable Composer installation scripts. Explicit project commands still run.                                                                                                                                                                  | **false**    | **boolean** | `true`                                           |
| **`ignore-plugins`**       | Disable Composer plugins during installation. When false, Composer allow-plugins configuration still applies.                                                                                                                                | **false**    | **boolean** | `true`                                           |
| **`lint`**                 | Composer lint script name or a JSON object with `command` (default `lint:ci`). Pass "false", "null" or an empty string to disable.                                                                                                           | **false**    | **string**  | `true`                                           |
| **`test`**                 | true for defaults, a Composer script, or JSON options (command, coverage boolean, coverage-reports array, cache). false, null or empty disables tests. Only the primary runtime contributes coverage.                                        | **false**    | **string**  | `true`                                           |
| **`package`**              | Validate a public Composer source distribution from the Git repository root.                                                                                                                                                                 | **false**    | **string**  | `false`                                          |
|                            | Pass "false" (the default) to disable, "true" for archive and autoload checks,                                                                                                                                                               |              |             |                                                  |
|                            | or a JSON object with `tests` for additional commands in an isolated Composer consumer.                                                                                                                                                      |              |             |                                                  |
|                            | Quote booleans because this input has type string. Example: `{"tests":"my-cli --help"}`.                                                                                                                                                     |              |             |                                                  |
|                            | vendor/bin is on PATH; PACKAGE_NAME, PACKAGE_INSTALL_PATH and PACKAGE_ARCHIVE_PATH identify the package.                                                                                                                                     |              |             |                                                  |
|                            | Unknown options and non-string tests are rejected before distribution checks.                                                                                                                                                                |              |             |                                                  |
| **`dependency-review`**    | Review dependency changes on pull requests.                                                                                                                                                                                                  | **false**    | **boolean** | `true`                                           |
| **`report-plan`**          | Expected producer metadata supplied by reusable workflows. Leave empty for standalone use.                                                                                                                                                   | **false**    | **string**  | -                                                |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**        | **Description**                                                      |
| ----------------- | -------------------------------------------------------------------- |
| **`report-plan`** | Complete expected report plan, consumed automatically by ci-reports. |

<!-- outputs:end -->
<!-- badges:start -->

[![Release](https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-php)](https://github.com/hoverkraft-tech/ci-github-php/releases)
[![License](https://img.shields.io/github/license/hoverkraft-tech/ci-github-php)](http://choosealicense.com/licenses/mit/)
[![Stars](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-php?style=social)](https://img.shields.io/github/stars/hoverkraft-tech/ci-github-php?style=social)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hoverkraft-tech/ci-github-php/blob/main/CONTRIBUTING.md)
![GitHub Verified Creator](https://img.shields.io/badge/GitHub-Verified%20Creator-4493F8?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSJyZ2IoNjgsIDE0NywgMjQ4KSI+CiAgPHBhdGggZD0ibTkuNTg1LjUyLjkyOS42OGMuMTUzLjExMi4zMzEuMTg2LjUxOC4yMTVsMS4xMzguMTc1YTIuNjc4IDIuNjc4IDAgMCAxIDIuMjQgMi4yNGwuMTc0IDEuMTM5Yy4wMjkuMTg3LjEwMy4zNjUuMjE1LjUxOGwuNjguOTI4YTIuNjc3IDIuNjc3IDAgMCAxIDAgMy4xN2wtLjY4LjkyOGExLjE3NCAxLjE3NCAwIDAgMC0uMjE1LjUxOGwtLjE3NSAxLjEzOGEyLjY3OCAyLjY3OCAwIDAgMS0yLjI0MSAyLjI0MWwtMS4xMzguMTc1YTEuMTcgMS4xNyAwIDAgMC0uNTE4LjIxNWwtLjkyOC42OGEyLjY3NyAyLjY3NyAwIDAgMS0zLjE3IDBsLS45MjgtLjY4YTEuMTc0IDEuMTc0IDAgMCAwLS41MTgtLjIxNUwzLjgzIDE0LjQxYTIuNjc4IDIuNjc4IDAgMCAxLTIuMjQtMi4yNGwtLjE3NS0xLjEzOGExLjE3IDEuMTcgMCAwIDAtLjIxNS0uNTE4bC0uNjgtLjkyOGEyLjY3NyAyLjY3NyAwIDAgMSAwLTMuMTdsLjY4LS45MjhjLjExMi0uMTUzLjE4Ni0uMzMxLjIxNS0uNTE4bC4xNzUtMS4xNGEyLjY3OCAyLjY3OCAwIDAgMSAyLjI0LTIuMjRsMS4xMzktLjE3NWMuMTg3LS4wMjkuMzY1LS4xMDMuNTE4LS4yMTVsLjkyOC0uNjhhMi42NzcgMi42NzcgMCAwIDEgMy4xNyAwWk03LjMwMyAxLjcyOGwtLjkyNy42OGEyLjY3IDIuNjcgMCAwIDEtMS4xOC40ODlsLTEuMTM3LjE3NGExLjE3OSAxLjE3OSAwIDAgMC0uOTg3Ljk4N2wtLjE3NCAxLjEzNmEyLjY3NyAyLjY3NyAwIDAgMS0uNDg5IDEuMThsLS42OC45MjhhMS4xOCAxLjE4IDAgMCAwIDAgMS4zOTRsLjY4LjkyN2MuMjU2LjM0OC40MjQuNzUzLjQ4OSAxLjE4bC4xNzQgMS4xMzdjLjA3OC41MDkuNDc4LjkwOS45ODcuOTg3bDEuMTM2LjE3NGEyLjY3IDIuNjcgMCAwIDEgMS4xOC40ODlsLjkyOC42OGMuNDE0LjMwNS45NzkuMzA1IDEuMzk0IDBsLjkyNy0uNjhhMi42NyAyLjY3IDAgMCAxIDEuMTgtLjQ4OWwxLjEzNy0uMTc0YTEuMTggMS4xOCAwIDAgMCAuOTg3LS45ODdsLjE3NC0xLjEzNmEyLjY3IDIuNjcgMCAwIDEgLjQ4OS0xLjE4bC42OC0uOTI4YTEuMTc2IDEuMTc2IDAgMCAwIDAtMS4zOTRsLS42OC0uOTI3YTIuNjg2IDIuNjg2IDAgMCAxLS40ODktMS4xOGwtLjE3NC0xLjEzN2ExLjE3OSAxLjE3OSAwIDAgMC0uOTg3LS45ODdsLTEuMTM2LS4xNzRhMi42NzcgMi42NzcgMCAwIDEtMS4xOC0uNDg5bC0uOTI4LS42OGExLjE3NiAxLjE3NiAwIDAgMC0xLjM5NCAwWk0xMS4yOCA2Ljc4bC0zLjc1IDMuNzVhLjc1Ljc1IDAgMCAxLTEuMDYgMEw0LjcyIDguNzhhLjc1MS43NTEgMCAwIDEgLjAxOC0xLjA0Mi43NTEuNzUxIDAgMCAxIDEuMDQyLS4wMThMNyA4Ljk0bDMuMjItMy4yMmEuNzUxLjc1MSAwIDAgMSAxLjA0Mi4wMTguNzUxLjc1MSAwIDAgMSAuMDE4IDEuMDQyWiI+PC9wYXRoPgo8L3N2Zz4K)

<!-- badges:end -->
<!-- examples:start -->
<!-- examples:end -->
<!-- contributing:start -->

## Contributing

Contributions are welcome! Please see the [contributing guidelines](https://github.com/hoverkraft-tech/ci-github-php/blob/main/CONTRIBUTING.md) for more details.

<!-- contributing:end -->
<!-- security:start -->
<!-- security:end -->
<!-- license:start -->

## License

This project is licensed under the MIT License.

SPDX-License-Identifier: MIT

Copyright © 2026 hoverkraft-tech

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->
<!-- generated:start -->

---

This documentation was automatically generated by [CI Dokumentor](https://github.com/hoverkraft-tech/ci-dokumentor).

<!-- generated:end -->
