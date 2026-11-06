<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItcGFja2FnZSIgY29sb3I9ImJsdWUiPjxsaW5lIHgxPSIxNi41IiB5MT0iOS40IiB4Mj0iNy41IiB5Mj0iNC4yMSI+PC9saW5lPjxwYXRoIGQ9Ik0yMSAxNlY4YTIgMiAwIDAgMC0xLTEuNzNsLTctNGEyIDIgMCAwIDAtMiAwbC03IDRBMiAyIDAgMCAwIDMgOHY4YTIgMiAwIDAgMCAxIDEuNzNsNyA0YTIgMiAwIDAgMCAyIDBsNy00QTIgMiAwIDAgMCAyMSAxNnoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIzLjI3IDYuOTYgMTIgMTIuMDEgMjAuNzMgNi45NiI+PC9wb2x5bGluZT48bGluZSB4MT0iMTIiIHkxPSIyMi4wOCIgeDI9IjEyIiB5Mj0iMTIiPjwvbGluZT48L3N2Zz4=) GitHub Action: Test Composer package

<!-- header:end -->
<!-- overview:start -->

## Overview

Test the committed Composer distribution in an isolated production installation, respecting Git export rules. No release artifact is produced.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/package/test@<commit-sha>
  with:
    # Git repository root containing the public composer.json. Set up PHP and Composer first.
    # Default: `.`
    working-directory: .

    # Optional shell commands in the isolated consumer. vendor/bin is on PATH. PACKAGE_NAME, PACKAGE_INSTALL_PATH and PACKAGE_ARCHIVE_PATH identify the tested package. Installation disables plugins and scripts; cleanup runs after success or failure.
    commands: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**               | **Description**                                                                                                                                                                                                                                     | **Required** | **Default** |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- |
| **`working-directory`** | Git repository root containing the public composer.json. Set up PHP and Composer first.                                                                                                                                                             | **false**    | `.`         |
| **`commands`**          | Optional shell commands in the isolated consumer. vendor/bin is on PATH. PACKAGE_NAME, PACKAGE_INSTALL_PATH and PACKAGE_ARCHIVE_PATH identify the tested package. Installation disables plugins and scripts; cleanup runs after success or failure. | **false**    | -           |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->
<!-- outputs:end -->
