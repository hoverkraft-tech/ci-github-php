<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Test PHP

<!-- header:end -->
<!-- overview:start -->

## Overview

Run Composer tests and report results, optionally uploading coverage.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/test@<commit-sha>
  with:
    # Composer project directory. Run setup-php first to install its dependencies.
    # Default: `.`
    working-directory: .

    # Composer script to execute unchanged, normally `test:ci` in composer.json.
    # The project defines its test tool, preparation and report generation. Examples:
    #
    # - PHPUnit: `phpunit --configuration phpunit.xml --log-junit=junit.xml --coverage-cobertura=cobertura.xml`
    # - Pest: `pest --ci --log-junit=junit.xml --coverage-cobertura=cobertura.xml`
    # - Codeception: `codecept run --xml=junit.xml --coverage-xml=clover.xml`;
    # enable coverage in codeception.yml and select `coverage: codecov` for its Clover XML.
    #
    # For Codecov, PHPUnit and Pest can use `--coverage-clover=clover.xml`.
    # Omit coverage arguments when collection is not needed. The coverage input controls publication only.
    # See the [CI guide](../../.github/workflows/continuous-integration.md).
    #
    # Default: `test:ci`
    command: test:ci

    # Coverage destination: `github` for report parsing, `codecov` for OIDC upload, or empty to disable coverage publication. Coverage files must be produced by the test command.
    # Default: `github`
    coverage: github
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                                                                                                                              | **Required** | **Default** |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- |
| **`working-directory`** | Composer project directory. Run setup-php first to install its dependencies.                                                                                                 | **false**    | `.`         |
| **`command`**           | Composer script to execute unchanged, normally `test:ci` in composer.json.                                                                                                   | **false**    | `test:ci`   |
|                         | The project defines its test tool, preparation and report generation. Examples:                                                                                              |              |             |
|                         |                                                                                                                                                                              |              |             |
|                         | - PHPUnit: `phpunit --configuration phpunit.xml --log-junit=junit.xml --coverage-cobertura=cobertura.xml`                                                                    |              |             |
|                         | - Pest: `pest --ci --log-junit=junit.xml --coverage-cobertura=cobertura.xml`                                                                                                 |              |             |
|                         | - Codeception: `codecept run --xml=junit.xml --coverage-xml=clover.xml`;                                                                                                     |              |             |
|                         | enable coverage in codeception.yml and select `coverage: codecov` for its Clover XML.                                                                                        |              |             |
|                         |                                                                                                                                                                              |              |             |
|                         | For Codecov, PHPUnit and Pest can use `--coverage-clover=clover.xml`.                                                                                                        |              |             |
|                         | Omit coverage arguments when collection is not needed. The coverage input controls publication only.                                                                         |              |             |
|                         | See the [CI guide](../../.github/workflows/continuous-integration.md).                                                                                                       |              |             |
| **`coverage`**          | Coverage destination: `github` for report parsing, `codecov` for OIDC upload, or empty to disable coverage publication. Coverage files must be produced by the test command. | **false**    | `github`    |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->
<!-- outputs:end -->
