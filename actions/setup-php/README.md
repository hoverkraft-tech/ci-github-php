<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Setup PHP

<!-- header:end -->
<!-- overview:start -->

## Overview

Set up PHP and Composer, cache downloads and install project dependencies with or without lockfiles.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/setup-php@<commit-sha>
  with:
    # Project directory relative to the checkout.
    # Default: `.`
    working-directory: .

    # Explicit PHP version. Empty reads the project or repository .php-version, then setup-php platform detection.
    php-version: ""

    # PHP extensions forwarded to shivammathur/setup-php.
    # Default: `mbstring, dom, xml, xmlwriter, curl, zip, intl`
    extensions: mbstring, dom, xml, xmlwriter, curl, zip, intl

    # Coverage driver: none, pcov or xdebug.
    # Default: `pcov`
    coverage: pcov

    # JSON array of Composer project directories relative to working-directory. Empty installs the root project and tools/composer.json when present, without recursive discovery.
    composer-directories: ""

    # Install project dependencies. Disable for jobs that only create an archive or install a separate consumer.
    # Default: `true`
    install-dependencies: "true"

    # Disable Composer installation scripts. Explicit Composer scripts run by later actions are unaffected.
    # Default: `true`
    ignore-scripts: "true"

    # Disable Composer plugins during installation. Set false when needed; composer.json allow-plugins still controls which plugins may run.
    # Default: `true`
    ignore-plugins: "true"
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**                  | **Description**                                                                                                                                                              | **Required** | **Default**                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------ |
| **`working-directory`**    | Project directory relative to the checkout.                                                                                                                                  | **false**    | `.`                                              |
| **`php-version`**          | Explicit PHP version. Empty reads the project or repository .php-version, then setup-php platform detection.                                                                 | **false**    | -                                                |
| **`extensions`**           | PHP extensions forwarded to shivammathur/setup-php.                                                                                                                          | **false**    | `mbstring, dom, xml, xmlwriter, curl, zip, intl` |
| **`coverage`**             | Coverage driver: none, pcov or xdebug.                                                                                                                                       | **false**    | `pcov`                                           |
| **`composer-directories`** | JSON array of Composer project directories relative to working-directory. Empty installs the root project and tools/composer.json when present, without recursive discovery. | **false**    | -                                                |
| **`install-dependencies`** | Install project dependencies. Disable for jobs that only create an archive or install a separate consumer.                                                                   | **false**    | `true`                                           |
| **`ignore-scripts`**       | Disable Composer installation scripts. Explicit Composer scripts run by later actions are unaffected.                                                                        | **false**    | `true`                                           |
| **`ignore-plugins`**       | Disable Composer plugins during installation. Set false when needed; composer.json allow-plugins still controls which plugins may run.                                       | **false**    | `true`                                           |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**        | **Description**                        |
| ----------------- | -------------------------------------- |
| **`php-version`** | Installed PHP major and minor version. |

<!-- outputs:end -->
