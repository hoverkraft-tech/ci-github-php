<!-- header:start -->

# GitHub Reusable Workflow: Release Composer package

<!-- header:end -->
<!-- overview:start -->

## Overview

Publish a Composer library after preparation and successful validation of the same
source commit. Both Node.js and Composer callers follow prepare, validate and release.

### Release model

Composer derives library versions from Git tags. Keep `version` out of
`composer.json`. Preparation plans the tag without changing source files, creating
Git tags or dispatching another run. Validation checks that same commit. Publication
verifies the source and tag again, then creates the GitHub release. GitHub provides
source archives; Packagist discovers tags through its configured update integration.

Use `ci-github-publish` for version planning, tag verification, release notes and
publication. A Composer source release needs no package artifact, version commit,
GitHub App or `CHANGELOG.md`. Repository and tag rules still apply.

### Complete caller workflow

Pin the same reviewed PHP workflow commit throughout the caller. Validation is
independent: use your own job or the shared CI workflow. Optional distribution
checks belong to validation; publication does not build, install dependencies or
run tests. Gate validation on preparation being ready, and publication on both jobs.
Pass the prepared tag unchanged. Every stage must use the same source commit.

```yaml
name: Release
on:
  workflow_dispatch:
    inputs:
      force:
        description: Release even without relevant changes
        type: boolean
        default: false
  schedule:
    - cron: "37 7 * * 1"
permissions: {}
concurrency:
  group: composer-release
  cancel-in-progress: false
jobs:
  prepare:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/prepare-package-release.yml@<commit-sha>
    permissions:
      contents: read
      pull-requests: read
    with:
      force: ${{ github.event_name == 'workflow_dispatch' && inputs.force || false }}
      release-config: &release-config |
        tag-template: v$RESOLVED_VERSION
        tag-prefix: v
  validate:
    needs: prepare
    if: needs.prepare.outputs.status == 'ready'
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@<commit-sha>
    permissions:
      contents: read
      id-token: write
    with:
      package: "true"
  release:
    needs: [prepare, validate]
    uses: hoverkraft-tech/ci-github-php/.github/workflows/release.yml@<commit-sha>
    permissions:
      contents: write
      pull-requests: read
    with:
      tag: ${{ needs.prepare.outputs.tag }}
      release-config: *release-config
    secrets:
      changelog-summary: ${{ secrets.CHANGELOG_SUMMARY }}
```

### No changes, force, and retries

Preparation returns `no-changes` when there is nothing to release. Both validation
and publication are skipped. `ready` supplies the planned tag and allows validation;
`released` means an explicitly retried tag is already published, so no work is needed.

On a manual default-branch run, `force: true` asks the shared planner for a release
even without changes. The configured version rules determine the next version;
force preserves that planned identity. Existing tag collisions fail. Schedules
ignore force. Tags are never moved.

Rerun a failed workflow to retry publication. To recover an older version after the
default branch advances, dispatch against its existing tag. Tag retries bypass version
planning and keep the original tag; force is ignored. The shared verifier requires
that tag to exist and match this run's source commit. Draft releases can be resumed.

The caller's concurrency group serializes the complete journey. The reusable
preparation and publication workflows use separate groups; keep caller names distinct
and disable cancellation. Validation failure prevents tag or release creation.

### Release configuration and summaries

Use partial YAML or JSON `release-config`, or `.github/release-config.yml`, as
supported by `ci-github-publish`. Shared defaults are inherited, repository settings
override them, and input settings take precedence. Pass identical configuration to
preparation and publication. Composer tags must be stable `X.Y.Z` or `vX.Y.Z` versions;
match the repository's existing tag prefix.

`changelog-summary` accepts the public JSON configuration supported by
`ci-github-publish/actions/release/create`, including its summary providers.
Use the optional secret for configuration containing credentials; it takes precedence
over the input. Omit both for generated release notes without AI.

See the [ci-github-publish release guide](https://github.com/hoverkraft-tech/ci-github-publish/blob/main/.github/workflows/release.md)
for configuration and summary details. Register the repository with Packagist and
configure its GitHub integration separately.

### Prepare release labels

Keep a separate `.github/workflows/prepare-release.yml` caller for the shared
`ci-github-publish/.github/workflows/prepare-release.yml`. It applies release labels
from Conventional Commit pull request titles. Package release preparation uses
`prepare-package-release.yml` and runs on manual or scheduled release events.
The label workflow uses pull request events `opened`, `reopened`, `synchronize`,
and `edited`, with `contents: read` and `pull-requests: write` permissions.
The shared label workflow owns its concurrency group.

### Permissions

- **`contents`**: `write`
- **`pull-requests`**: `read`

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
name: Release Composer Package
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  release:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/release.yml@<commit-sha>
    permissions:
      contents: write
      pull-requests: read
    secrets:
      # Complete optional JSON summary configuration, including provider credentials. Overrides the input.
      changelog-summary: ""
    with:
      # Composer version tag returned by prepare-package-release. Require successful validation of this source commit with needs before publication.
      # This input is required.
      tag: ""

      # Partial YAML or JSON configuration forwarded to ci-github-publish/actions/release/create. Use the same configuration as preparation.
      release-config: ""

      # Optional JSON summary configuration forwarded to ci-github-publish/actions/release/create. Supports its providers and options. Use the secret for credentials.
      changelog-summary: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**               | **Description**                                                                                                                                                | **Required** | **Type**   | **Default** |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------- | ----------- |
| **`tag`**               | Composer version tag returned by prepare-package-release. Require successful validation of this source commit with needs before publication.                   | **true**     | **string** | -           |
| **`release-config`**    | Partial YAML or JSON configuration forwarded to ci-github-publish/actions/release/create. Use the same configuration as preparation.                           | **false**    | **string** | -           |
| **`changelog-summary`** | Optional JSON summary configuration forwarded to ci-github-publish/actions/release/create. Supports its providers and options. Use the secret for credentials. | **false**    | **string** | -           |

<!-- inputs:end -->
<!-- secrets:start -->

## Secrets

| **Secret**              | **Description**                                                                                    | **Required** |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------ |
| **`changelog-summary`** | Complete optional JSON summary configuration, including provider credentials. Overrides the input. | **false**    |

<!-- secrets:end -->
<!-- outputs:start -->
<!-- outputs:end -->
