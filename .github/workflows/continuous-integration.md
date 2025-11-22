# Continuous Integration Workflow

This reusable workflow performs comprehensive continuous integration steps for PHP projects.

## Features

- 🛡️ **CodeQL Analysis** - Security scanning with GitHub's CodeQL
- 🛡️ **Dependency Review** - Automated dependency vulnerability scanning for PRs
- 👕 **Linting** - Code quality checks with PHP linters and PR annotations via [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports)
- 🏗️ **Build** - Optional build steps with environment variables and artifact support
- 🧪 **Testing** - Automated test execution with PHPUnit
- 📊 **Code Coverage** - Coverage reporting with GitHub PR comments or Codecov
- 🐳 **Advanced Container Support** - Run jobs inside Docker containers with full configuration options
- 🗺️ **Path Mapping** - Automatic path mapping for containerized environments
- 🎯 **Custom Runners** - Specify custom GitHub runners

## Usage

To use this workflow in your repository, create a workflow file (e.g., `.github/workflows/ci.yml`):

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  security-events: write
  pull-requests: write
  id-token: write

jobs:
  continuous-integration:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      # All inputs are optional
      checks: true
      lint: "true"
      test: "true"
      code-ql: "php"
      dependency-review: true
      working-directory: "."
```

## Inputs

| Name                  | Type    | Required | Default              | Description                                                                     |
| --------------------- | ------- | -------- | -------------------- | ------------------------------------------------------------------------------- |
| `runs-on`             | string  | No       | `["ubuntu-latest"]`  | JSON array of runner(s) to use. See [GitHub docs](https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job). |
| `build`               | string  | No       | `"build"`            | Build parameters. Can be a string, JSON array, or JSON object. See [Build Configuration](#build-configuration). |
| `checks`              | boolean | No       | `true`               | Enable check steps (lint, build, test).                                        |
| `lint`                | string  | No       | `"true"`             | Enable linting. Set to empty to disable. Accepts JSON object for options. See [lint action](../actions/lint/README.md). Scripts should generate reports in standard formats. Example: `lint:ci` script. |
| `code-ql`             | string  | No       | `"php"`              | CodeQL analysis language. Set to empty string to disable. See [CodeQL docs](https://github.com/github/codeql-action). |
| `dependency-review`   | boolean | No       | `true`               | Enable dependency review scan. See [dependency-review-action](https://github.com/actions/dependency-review-action). |
| `test`                | string  | No       | `"true"`             | Enable testing. Set to empty to disable. Accepts JSON object for options. See [test action](../actions/test/README.md). Scripts should generate test and coverage reports in standard formats. Example: `test:ci` script. |
| `working-directory`   | string  | No       | `"."`                | Working directory where the dependencies are installed.                        |
| `container`           | string  | No       | `""`                 | Container configuration. Accepts string (image name) or JSON object with advanced options. See [Container Configuration](#container-configuration). |

## Secrets

| Name                 | Description                                                                     | Required |
| -------------------- | ------------------------------------------------------------------------------- | -------- |
| `build-secrets`      | Multi-line env-formatted secrets for build step. Example: `SECRET=${{ secrets.SECRET }}` | No |
| `container-password` | Password for container registry authentication. Required for private registries. | No |
| `github-token`       | GitHub token to use for authentication. Defaults to `GITHUB_TOKEN` if not provided. | No |

## Outputs

| Name                | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `build-artifact-id` | ID of the build artifact uploaded during the build step (if any)    |

## Build Configuration

The `build` input supports multiple formats:

### Simple String

```yaml
with:
  build: "build"
```

### Multiple Commands (Newline-separated)

```yaml
with:
  build: |
    build
    docs
```

### JSON Array

```yaml
with:
  build: '["build", "docs"]'
```

### JSON Object with Environment Variables

```yaml
with:
  build: |
    {
      "commands": ["build"],
      "env": {
        "APP_ENV": "production",
        "API_URL": "https://api.example.com"
      }
    }
```

### JSON Object with Artifact

```yaml
with:
  build: |
    {
      "commands": ["build", "compile"],
      "artifact": ["dist/", "build/"]
    }
```

When specifying an artifact, the build output will be uploaded and made available to the test job.

## Container Configuration

The `container` input supports two formats:

### Simple String (Image Name)

```yaml
with:
  container: "php:8.2-cli"
```

### JSON Object (Advanced)

```yaml
with:
  container: |
    {
      "image": "php:8.2-cli",
      "env": {
        "APP_ENV": "production"
      },
      "options": "--cpus 2",
      "ports": [8080, 3000],
      "volumes": ["/tmp:/tmp", "/cache:/cache"],
      "credentials": {
        "username": "myusername"
      },
      "pathMapping": {
        "/app": "."
      }
    }
```

**Supported Properties:**

- `image` (required) - Container image name
- `env` (object) - Environment variables
- `options` (string) - Additional Docker options
- `ports` (array) - Ports to expose
- `volumes` (array) - Volume mounts
- `credentials` (object) - Registry credentials (username + password secret)
- `pathMapping` (object) - Path mapping from container to repository paths

When using `credentials`, you must also provide the `container-password` secret.

## Lint Configuration

The `lint` input can be:

- `"true"` (default): Enable linting with default settings (uses `lint:ci` composer script)
- `""` or `null`: Disable linting
- JSON object: Custom lint options (see [lint action](../actions/lint/README.md))

Example with custom command:

```yaml
with:
  lint: |
    {
      "command": "lint:checkstyle",
      "report-file": "custom-checkstyle.xml"
    }
```

## Test Configuration

The `test` input can be:

- `"true"` (default): Enable testing with GitHub coverage (uses `test:ci` composer script)
- `""` or `null`: Disable testing
- JSON object: Custom test options (see [test action](../actions/test/README.md))

Example with Codecov:

```yaml
with:
  test: |
    {
      "coverage": "codecov"
    }
```

Example with custom command and report:

```yaml
with:
  test: |
    {
      "command": "test:with-coverage",
      "coverage": "github",
      "report-file": "build/logs/clover.xml,junit.xml"
    }
```

## Jobs

### Prepare

Parses container configuration and extracts settings for use by other jobs. This job:
- Validates container input format
- Extracts container image, environment, options, ports, volumes
- Handles container registry credentials
- Sets up path mapping for containerized environments

### CodeQL Analysis

Performs security scanning using GitHub's CodeQL engine. Runs if:
- `checks` is `true`
- `code-ql` is not empty

### Dependency Review

Scans dependencies for known vulnerabilities. Runs if:
- Event is a pull request
- `checks` is `true`
- `dependency-review` is `true`

### Setup

Prepares the environment by:
- Checking out repository code (if not in container mode)
- Parsing build configuration from input

### Lint

Runs linting tools with PR annotations. Runs if:
- `checks` is `true`
- `lint` is not empty

The lint action:
- Executes `composer lint:ci` (or specified command)
- Uses [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) to process reports
- Adds GitHub annotations for linting issues
- Supports path mapping for container environments
- See [lint action](../../actions/lint/README.md) for details

### Build

Executes build commands if specified. Runs if:
- `checks` is `true`
- `build` input is provided

The build action:
- Executes composer scripts
- Sets environment variables and secrets
- Uploads artifacts if configured
- See [build action](../../actions/build/README.md) for details

### Test

Runs test suite with coverage reporting. Runs if:
- `checks` is `true`
- `test` is not empty

The test action:
- Executes `composer test:ci` (or specified command)
- Uses [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) to process test/coverage reports
- Posts coverage summary to PRs (default)
- Uploads to Codecov (if configured)
- Supports path mapping for container environments
- See [test action](../../actions/test/README.md) for details

## Examples

### Minimal Configuration

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
```

### Custom Composer Scripts

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      lint: |
        {
          "command": "lint:strict"
        }
      test: |
        {
          "command": "test:integration"
        }
```

### Custom Configuration

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      working-directory: "./api"
      code-ql: ""  # Disable CodeQL
      test: |
        {
          "coverage": ""
        }
```

### With Build Steps

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      build: |
        {
          "commands": ["build", "compile"],
          "artifact": ["dist/", "build/"]
        }
```

### With Build Secrets

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      build: "build"
    secrets:
      build-secrets: |
        SECRET_KEY=${{ secrets.SECRET_KEY }}
        API_TOKEN=${{ secrets.API_TOKEN }}
```

### Skip Linting

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      lint: ""
```

### With Codecov

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      test: |
        {
          "coverage": "codecov"
        }
```

### In Docker Container (Simple)

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      container: "php:8.2-cli"
```

### In Docker Container (Advanced)

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      container: |
        {
          "image": "my-php-image:latest",
          "env": {
            "APP_ENV": "testing"
          },
          "pathMapping": {
            "/app": "."
          }
        }
```

### With Private Container Registry

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      container: |
        {
          "image": "registry.example.com/my-php-image:latest",
          "credentials": {
            "username": "myusername"
          }
        }
    secrets:
      container-password: ${{ secrets.CONTAINER_PASSWORD }}
```

### On Self-Hosted Runners

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      runs-on: '["self-hosted", "linux", "x64"]'
```

## Required Scripts in composer.json

Your `composer.json` should define the following scripts:

```json
{
  "scripts": {
    "lint": "phpstan analyse || php-cs-fixer fix --dry-run",
    "test": "phpunit"
  }
}
```

## Required Permissions

The workflow requires the following permissions:

```yaml
permissions:
  contents: read           # For checking out code
  security-events: write   # For CodeQL
  pull-requests: write     # For coverage PR comments
  id-token: write          # For OIDC authentication (Codecov, workflow refs)
```

If you don't need all features, you can reduce permissions:

### Minimal (No CodeQL, No Coverage Comments)

```yaml
permissions:
  contents: read
  id-token: write
```

### With CodeQL

```yaml
permissions:
  contents: read
  security-events: write
  id-token: write
```

### With Coverage PR Comments

```yaml
permissions:
  contents: read
  pull-requests: write
  id-token: write
```

## Container Mode

When running in a container, the workflow expects:

1. **Pre-installed dependencies**: The container must have PHP, Composer, and project dependencies installed
2. **Project code**: The code should be pre-baked into the container at the working directory
3. **Root user**: Container runs as root to allow GitHub Actions features

Example:

```dockerfile
FROM php:8.2
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader
COPY . .
```

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      container: "my-company/my-app:latest"
```

## Coverage Integration

### GitHub Coverage (Default)

Posts coverage summary as PR comment using ReportGenerator:

```yaml
jobs:
  ci:
    permissions:
      pull-requests: write
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      test: |
        {
          "coverage": "github"
        }
```

### Codecov

Uploads coverage to Codecov with OIDC:

```yaml
jobs:
  ci:
    permissions:
      id-token: write
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      test: |
        {
          "coverage": "codecov"
        }
```

## Troubleshooting

### "composer.json not found"

Ensure your repository has a `composer.json` file in the root or specified `working-directory`.

### "composer.lock not found"

The workflow requires `composer.lock` for reproducible builds. Generate it with:

```bash
composer install
git add composer.lock
git commit -m "Add composer.lock"
```

### Lint script not found

Add a `lint` script to your `composer.json`:

```json
{
  "scripts": {
    "lint": "phpstan analyse"
  }
}
```

### Test script not found

Add a `test` script to your `composer.json`:

```json
{
  "scripts": {
    "test": "phpunit"
  }
}
```
