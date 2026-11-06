<!-- header:start -->

# GitHub Reusable Workflow: Build PHP documentation

<!-- header:end -->
<!-- overview:start -->

## Overview

Build PHP API documentation with phpDocumentor and upload it for a separate deployment job.

The workflow uses the project's phpDocumentor configuration when present, or documents
`src/` by default. It puts the generated site in `_site/phpdoc/` and uploads `_site/`.
No Composer installation or deployment is performed. Use ci-github-publish deployment
actions in the caller to combine API documentation with guides or publish GitHub Pages.

### Permissions

- **`contents`**: `read`

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
name: Build PHP documentation
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  documentation:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/documentation.yml@<commit-sha>
    permissions:
      contents: read
    with:
      # JSON array of Linux runner labels. The runner must support Docker containers.
      # Default: `["ubuntu-latest"]`
      runs-on: '["ubuntu-latest"]'

      # PHP project directory relative to the checkout.
      # Default: `.`
      working-directory: .
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**               | **Description**                                                               | **Required** | **Type**   | **Default**         |
| ----------------------- | ----------------------------------------------------------------------------- | ------------ | ---------- | ------------------- |
| **`runs-on`**           | JSON array of Linux runner labels. The runner must support Docker containers. | **false**    | **string** | `["ubuntu-latest"]` |
| **`working-directory`** | PHP project directory relative to the checkout.                               | **false**    | **string** | `.`                 |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**        | **Description**                     |
| ----------------- | ----------------------------------- |
| **`artifact-id`** | Uploaded documentation artifact ID. |

<!-- outputs:end -->
