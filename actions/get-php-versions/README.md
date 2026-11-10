<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItbGlzdCIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSI4IiB5MT0iNiIgeDI9IjIxIiB5Mj0iNiI+PC9saW5lPjxsaW5lIHgxPSI4IiB5MT0iMTIiIHgyPSIyMSIgeTI9IjEyIj48L2xpbmU+PGxpbmUgeDE9IjgiIHkxPSIxOCIgeDI9IjIxIiB5Mj0iMTgiPjwvbGluZT48bGluZSB4MT0iMyIgeTE9IjYiIHgyPSIzLjAxIiB5Mj0iNiI+PC9saW5lPjxsaW5lIHgxPSIzIiB5MT0iMTIiIHgyPSIzLjAxIiB5Mj0iMTIiPjwvbGluZT48bGluZSB4MT0iMyIgeTE9IjE4IiB4Mj0iMy4wMSIgeTI9IjE4Ij48L2xpbmU+PC9zdmc+) GitHub Action: Get PHP versions

<!-- header:end -->
<!-- overview:start -->

## Overview

Discover stable PHP releases matching composer.json require.php using Composer constraints. Runs in Docker on Linux without changing the runner's PHP installation.

### PHP version selection

Declare supported PHP versions in `composer.json`:

```json
{
  "require": {
    "php": "^8.2"
  }
}
```

The CI workflow discovers stable releases allowed by that constraint and tests
the newest matching patch of each minor. Its highest version runs lint and package
checks and publishes coverage. A new stable minor is included when the constraint
already allows it. Explicitly restricted ranges require a deliberate Composer change
before CI adds another minor. End-of-life versions remain tested when still allowed.

Discovery uses PHP.net release metadata and Composer's constraint parser. It handles
patch bounds and disjoint ranges without approximating them as npm SemVer.
Prereleases are excluded. A missing or invalid `require.php`, an unavailable release
catalog, or a constraint with no matching stable release causes an error. Dependency
installation still validates the project and tooling against the selected runtime.

The discovery action builds and runs its Docker image on Linux runners with Docker,
using the runner's UID/GID and a read-only checkout mount.
CI and local builds use the same container runtime and locked dependencies. Discovery
does not change PHP on the runner. The setup action then installs the selected PHP
version when the job needs it.

### Overrides

`php-versions` overrides the CI matrix. Its last entry is primary. Automatic matrix
discovery uses `require.php` even when a `.php-version` file exists.

The setup action selects its runtime in this order:

1. Its explicit `php-version` input.
2. The project `.php-version`, then the repository `.php-version`.
3. Composer platform overrides, as supported by `shivammathur/setup-php`.
4. The highest stable PHP release allowed by `require.php`.

Version files are optional. Ordinary consumers need only their Composer constraint.
The standalone `get-php-versions` action exposes both the full matrix and its highest
version for custom jobs; discovery does not install project dependencies or run hooks.

### Local Docker builds

Local builds read the resolver revision from the existing `ci-github-php` workflow
pins in the checkout. Dependency updates to those workflow pins also update local
builds. No separate resolver revision needs configuration. Its Docker entry point
reads the project through a read-only mount and requires no PHP on the host.

```sh
set -eu
workflow_ref=$(grep -hE '^[[:space:]]*(-[[:space:]]*)?uses:' .github/workflows/*.y*ml |
  grep -oE 'hoverkraft-tech/ci-github-php/[^@[:space:]]+@[a-f0-9]{40}' |
  cut -d@ -f2 | sort -u)
if [ "${#workflow_ref}" -ne 40 ]; then
  echo 'Expected one consistent ci-github-php commit pin in .github/workflows.' >&2
  exit 1
fi
docker build --tag php-version-resolver \
  "https://github.com/hoverkraft-tech/ci-github-php.git#${workflow_ref}:actions/get-php-versions"
PHP_VERSION=$(docker run --rm --volume "$PWD:/project:ro" php-version-resolver)
docker build --build-arg "VERSION=$PHP_VERSION" .
```

Automatic selection requires workflow files with one consistent commit pin for
`ci-github-php`. Missing or conflicting pins stop the build before fetching the
resolver. Explicit `PHP_VERSION` overrides in the consumer Makefiles skip discovery.

Docker caches the resolver image's dependencies. Each invocation consults the release
catalog, so newly available compatible releases need no Makefile version edit. The
resolver prints the highest matching patch by default. Pass `/project` as its only
argument to print the complete JSON result instead.

Local Makefiles can keep a `PHP_VERSION` override for explicit compatibility testing.
When no override is supplied, use the resolver for the build and a stable local
development image name for subsequent commands.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/get-php-versions@871b3c4cd7fe8904e49e612ec072c9df3b4fe853
  with:
    # Project directory relative to the checkout.
    # Default: `.`
    working-directory: .
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                             | **Required** | **Default** |
| ----------------------- | ------------------------------------------- | ------------ | ----------- |
| **`working-directory`** | Project directory relative to the checkout. | **false**    | `.`         |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**         | **Description**                                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`php-versions`** | JSON array of matching releases, with the newest compatible patch per minor, sorted ascending. Includes end-of-life versions allowed by require.php; excludes prereleases. |
| **`php-version`**  | Highest stable PHP release matching require.php.                                                                                                                           |

<!-- outputs:end -->
<!-- examples:start -->
<!-- examples:end -->
