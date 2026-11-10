# ADR 0001: Composer CI and source releases

- Status: Proposed
- Date: 2026-11-05

## Context

The PHP workflow prototype mixed runtime detection, dependency installation, and
individual tool detection. Its integration workflow still referred to Node.js
fixtures, and its PHP CodeQL configuration could not run. The Node.js workflows
provide the desired separation between validation, package creation, and release.

The five initial candidates are Composer libraries rather than deployable web
applications. Each supports PHP 8.2 through 8.5, has a separate `tools/composer.json`,
and does not commit a Composer lockfile. Their Composer scripts already describe
lint and test commands.

## Decision

Use Composer scripts as the project interface. Setup installs one or more Composer
projects, caches downloads, and disables installation scripts and plugins by
default. Reuse `ci-github-common` for reports and `ci-github-publish` for release
planning, configuration, summaries, and publication. Default dependency discovery
is bounded to the root and `tools/composer.json`; explicit directories override it.
CI groups command, coverage publication and cache options under `test`. Linux
runner selection applies to all jobs; `checks: false` skips validation. Action
integration workflows each target a single action. Projects define `lint:ci`
and `test:ci` Composer scripts, including their report formats and preparation.
The action adds no test-runner arguments. Only the primary PHP version publishes
coverage; the project command controls collection across all tested versions.

The follow-up review on 2026-11-06 supersedes the earlier proposed PHPUnit argument
injection, test-runner switch and generic PHP build action. None of the five
candidates used that build contract. Composer scripts and dedicated caller jobs
already handle project-specific generated files. The CI guide is maintained in
the workflow's leading comments and generated into its adjacent Markdown file.

Use the shared release planner, verifier and creator. The verifier accepts omitted
artifacts for source releases while retaining identity checks for supplied artifacts.
PHP only validates its Composer manifest, supported version format and caller context.
Use `ci-github-common/actions/quality/codecov` for coverage upload and dependency setup;
test commands own report generation and format selection.

Keep CI independent from publication. CI validates application source or a public
source package. Package checks install the committed archive
as an isolated production dependency and allow a small project-specific smoke test.

Expose the same prepare, validate and release journey as Node.js. Read-only
preparation returns `ready`, `no-changes` or `released` and a tag when ready. Callers
skip validation and publication when preparation finds nothing to do. Publication
accepts the prepared tag and depends on successful validation of the same commit.
Shared tag verification runs before validation and again before publication. Tags
are never moved. Caller concurrency spans the journey; preparation and publication
have distinct reusable-workflow groups.

The 2026-11-07 review supersedes the 2026-11-06 decision to plan inside publication.
That simplification made no-change runs validate unnecessarily and gave PHP a
different caller contract. A lightweight preparation workflow restores the common
journey without version commits, a dispatch, or artifact handoff. Generic force
planning and tag recovery belong to `ci-github-publish`. The 2026-11-06 removal of
public package creation and artifact transfer remains: distribution checks create
and clean their own optional CI snapshot.

Composer resolves library versions from Git tags. Omit `composer.json`'s `version`
field and avoid an npm-style version commit or preparation PR. GitHub release notes
hold the changelog; no `CHANGELOG.md` is generated. A GitHub App is not required for
this package release flow, subject to the caller's tag rules and repository access.

The initial package scope is one public Composer package at a Git repository root.
Private registry authentication, splitting monorepos, prerelease channels, and
application deployment targets need concrete consumers before adding interfaces.

## Composer-based PHP version discovery

The 2026-11-11 review replaces the default single-runtime CI selection with a
matrix derived from `composer.json`'s `require.php`. The same standalone resolver
selects the highest matching runtime for setup and local Docker builds. PHP.net
supplies released versions; Composer's own SemVer library handles constraints,
including tilde semantics, disjunctions, exclusions and patch bounds. Keep the
newest matching patch for each minor and exclude prereleases. End-of-life minors
remain in the matrix when the project still declares support for them.

Explicit workflow matrices, setup inputs, version files and Composer platform
overrides remain available. A version file affects default setup, not the
automatically discovered CI compatibility matrix. Projects need not copy their
supported versions into a matrix, a default-runtime file and a Makefile.

Discovery requires network access and fails clearly when the catalog or constraint
is unavailable. It never falls back to an unconstrained latest release. The
resolver uses the PHP runtime and locked Composer dependency in its Docker image;
that tooling runtime does not change the versions supported by consumer packages.
The action and local Docker entry point share the exact resolver and require no host PHP.

Docker execution replaces the initial PHP/Composer bootstrap on the runner. It
requires Linux with Docker. The entry point validates paths against the mounted
workspace; project dependencies and hooks are never executed.

The same-day security review supersedes native Docker-action execution, which
required the root user and scanner exceptions for GitHub's workspace/output mounts.
The image defaults to an unprivileged user. A composite step uses `github-script`'s
`exec` helper to build it and run it with the runner's UID/GID and a read-only
checkout mount. `core` publishes the JSON outputs from the host, so the container
needs no writable output mount. Trivy and Checkov retain their default-user checks
without exceptions. Dependabot's recursive action directories cover the resolver's
Composer manifest and lockfile as well as its Docker base image.

The same review rejects a separately configured resolver revision in each Makefile.
Local builds derive it from the existing workflow commit pins, keeping dependency
updates effective for both CI and local tooling. Missing or conflicting pins fail
before fetching the resolver. This couples automatic local selection to a checkout
with consistent workflow pins; an explicit PHP version bypasses discovery.

## Alternatives

Copying npm's version-update step would introduce source churn that Composer does
not require. Packaging build output would test a different distribution from the
one Packagist obtains from GitHub. Automatic discovery of individual lint tools
would duplicate project scripts and fail for separate tool installations.

## Consequences

Source packages must contain their runtime files in Git and use `.gitattributes`
to control distribution. Applications supply their own generation and deployment
jobs when needed. Projects requiring Composer installation hooks or plugins opt in.
A configured Packagist integration is needed to discover newly created tags.

## Candidate findings

The initial audit and local source-archive installation checks were performed on
2026-11-05. These are dated design evidence; caller PR checks provide current
integration results.

| Candidate                             | Baseline commit                            | Additional consumer check                           |
| ------------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| `neilime/twbs-helper-module`          | `13252379e4ca357691ad3f3af56f925406d573a6` | Load module configuration and packaged templates    |
| `neilime/ansi-to-html-twig-extension` | `47fbe480819bf5913f830f93b08f476fd9093988` | Render ANSI colors through Twig                     |
| `neilime/ansi-escapes-to-html`        | `587947f13b98ab8018a5d043e74d9a23f4765b83` | Convert ANSI color codes                            |
| `neilime/geshi-twig-extension`        | `5991c622dbc1928c1d18170c7800954332ceb974` | Render highlighted code through Twig and GeSHi      |
| `neilime/php-css-lint`                | `1b1a322e2ad5053e0293b2f024cc6af56c7b9b80` | Run the installed CLI against valid and invalid CSS |

The CLI's test fixtures require network downloads and retain their existing cache.
The module's documentation build remains an independent validation job.
Four candidates share phpDocumentor API generation. A dedicated build workflow
provides its artifact for PR validation and separate site deployment; the module's
custom Markdown and Docusaurus generation remains project-owned.

## Sources

- [Composer libraries and versioning](https://getcomposer.org/doc/02-libraries.md)
- [Composer script and plugin execution](https://getcomposer.org/doc/faqs/how-to-install-untrusted-packages-safely.md)
- [PHP setup action](https://github.com/shivammathur/setup-php)
- [Packagist publishing](https://packagist.org/about)
- [GitHub language support](https://docs.github.com/en/get-started/learning-about-github/github-language-support)
