<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Lint PHP

<!-- header:end -->
<!-- overview:start -->

## Overview

Run a project-defined Composer lint script and report results.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/lint@<commit-sha>
  with:
    # Composer project directory. Run setup-php first to install its dependencies.
    # Default: `.`
    working-directory: .

    # Composer script to execute, normally `lint:ci` in composer.json.
    # Define the tools and their configuration in that script. Examples:
    #
    # - PHPStan: `phpstan analyse --error-format=checkstyle > phpstan-checkstyle.xml`
    # - Psalm: `psalm --output-format=checkstyle > psalm-checkstyle.xml`
    # - PHP_CodeSniffer: `phpcs --report=checkstyle --report-file=phpcs-checkstyle.xml`
    # - PHP CS Fixer: `php-cs-fixer check --format=checkstyle > php-cs-fixer-checkstyle.xml`
    #
    # Redirecting output preserves the tool's exit status. The action discovers
    # Checkstyle reports for annotations and summaries. Use paths relative to the project;
    # for separate tooling installations, prefix binaries with `tools/vendor/bin/`.
    # See the [CI guide](../../.github/workflows/continuous-integration.md).
    #
    # Default: `lint:ci`
    command: lint:ci
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                                        | **Required** | **Default** |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------ | ----------- |
| **`working-directory`** | Composer project directory. Run setup-php first to install its dependencies.           | **false**    | `.`         |
| **`command`**           | Composer script to execute, normally `lint:ci` in composer.json.                       | **false**    | `lint:ci`   |
|                         | Define the tools and their configuration in that script. Examples:                     |              |             |
|                         |                                                                                        |              |             |
|                         | - PHPStan: `phpstan analyse --error-format=checkstyle > phpstan-checkstyle.xml`        |              |             |
|                         | - Psalm: `psalm --output-format=checkstyle > psalm-checkstyle.xml`                     |              |             |
|                         | - PHP_CodeSniffer: `phpcs --report=checkstyle --report-file=phpcs-checkstyle.xml`      |              |             |
|                         | - PHP CS Fixer: `php-cs-fixer check --format=checkstyle > php-cs-fixer-checkstyle.xml` |              |             |
|                         |                                                                                        |              |             |
|                         | Redirecting output preserves the tool's exit status. The action discovers              |              |             |
|                         | Checkstyle reports for annotations and summaries. Use paths relative to the project;   |              |             |
|                         | for separate tooling installations, prefix binaries with `tools/vendor/bin/`.          |              |             |
|                         | See the [CI guide](../../.github/workflows/continuous-integration.md).                 |              |             |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->
<!-- outputs:end -->
