<!-- header:start -->

# GitHub Reusable Workflow: Prepare Composer Package Release

<!-- header:end -->
<!-- overview:start -->

## Overview

Plan a Composer source release before validation, without changing repository state.
Continue only when status is ready, then pass tag to the release workflow.
See [the release guide](release.md) for the complete prepare, validate and release journey.

### Permissions

- **`contents`**: `read`
- **`pull-requests`**: `read`

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
name: Prepare Composer Package Release
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  prepare-package-release:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/prepare-package-release.yml@<commit-sha>
    permissions:
      contents: read
      pull-requests: read
    with:
      # Partial YAML or JSON configuration forwarded to ci-github-publish/actions/release/plan. Pass the same configuration to preparation and publication.
      release-config: ""

      # Plan a release without relevant changes on manual default-branch runs. Ignored on schedules and tag retries. Shared planning preserves higher versions and never overwrites tags.
      force: false
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**            | **Description**                                                                                                                                                                   | **Required** | **Type**    | **Default** |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- | ----------- |
| **`release-config`** | Partial YAML or JSON configuration forwarded to ci-github-publish/actions/release/plan. Pass the same configuration to preparation and publication.                               | **false**    | **string**  | -           |
| **`force`**          | Plan a release without relevant changes on manual default-branch runs. Ignored on schedules and tag retries. Shared planning preserves higher versions and never overwrites tags. | **false**    | **boolean** | `false`     |

<!-- inputs:end -->
<!-- secrets:start -->
<!-- secrets:end -->
<!-- outputs:start -->

## Outputs

| **Output**   | **Description**                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| **`status`** | ready, no-changes or released. Only ready should start validation and publication.                        |
| **`tag`**    | Planned or recovered Composer version tag. Available when status is ready; pass unchanged to release.yml. |

<!-- outputs:end -->
