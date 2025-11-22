# Lint

This action lints PHP projects with support for pull request reporting and annotations.

## Features

- 👕 Executes lint command via Composer
- 📊 Auto-detects and processes lint reports via [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports)
- 💬 Annotates pull requests with linting issues
- 🐳 Supports running in Docker containers
- 🗺️ Path mapping support for containerized environments

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/lint@main
  with:
    working-directory: "."
    container: "false"
    command: "lint:ci"
```

## Inputs

| Name                 | Description                                                                 | Required | Default |
| -------------------- | --------------------------------------------------------------------------- | -------- | ------- |
| `working-directory`  | Working directory where lint commands are executed. Can be absolute or relative to the repository root. | No | `.` |
| `container`          | Whether running in container mode (skips checkout and PHP setup)           | No       | `false` |
| `command`            | Composer script command to run for linting. Should generate lint reports in standard formats. | No | `lint:ci` |
| `report-file`        | Optional lint report path forwarded to parse-ci-reports. When omitted, uses "auto:lint" detection. | No | `` |
| `path-mapping`       | Optional path mapping to adjust file paths in reports. Format: "container_path:repo_path,..." | No | `` |

## How It Works

1. **Environment Setup** (if not in container mode):
   - Sets up PHP using the setup-php action
   - Configures caching for PHPStan, Psalm, and PHP CS Fixer

2. **Run Linting**:
   - Executes `composer {command}` (default: `composer lint:ci`)
   - Captures exit code and output

3. **Report Processing**:
   - Uses [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) action to auto-detect and process lint reports
   - Supports multiple report formats (Checkstyle XML, ESLint JSON, etc.)
   - Adds GitHub annotations and summary to pull requests

## Report File Auto-Detection

When `report-file` is not specified, the action uses "auto:lint" detection which searches for common lint report patterns in your working directory.

## Examples

### Basic Usage

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/lint@main
```

### With Custom Command

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/lint@main
        with:
          command: "lint:checkstyle"
```

### With Custom Report File

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/lint@main
        with:
          report-file: "build/checkstyle.xml"
```

### In Container Mode with Path Mapping

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    container:
      image: my-php-image:latest
    steps:
      - uses: hoverkraft-tech/ci-github-php/actions/lint@main
        with:
          container: "true"
          path-mapping: "/app:."
```

### Custom Working Directory

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/lint@main
        with:
          working-directory: "./api"
```

## Required Composer Script

Your `composer.json` should define a `lint:ci` script (or the command you specify):

```json
{
  "scripts": {
    "lint:ci": [
      "@phpstan",
      "@php-cs-fixer"
    ],
    "phpstan": "phpstan analyse src --level=max --no-progress",
    "php-cs-fixer": "php-cs-fixer fix --dry-run --diff",
    "phpstan": "phpstan analyse"
  }
}
```

## Generating Checkstyle Reports

To enable PR annotations, configure your linting tools to output Checkstyle XML:

### PHP CS Fixer

```json
{
  "scripts": {
    "lint": "php-cs-fixer fix --dry-run --format=checkstyle > checkstyle.xml || true"
  }
}
```

### PHPCS

```json
{
  "scripts": {
    "lint": "phpcs --report=checkstyle --report-file=checkstyle.xml"
  }
}
```

### PHPStan

```json
{
  "scripts": {
    "lint": "phpstan analyse --error-format=checkstyle > checkstyle.xml || true"
  }
}
```

## Output

The action sets the following output:

- `lint-exit-code`: The exit code from the lint command (0 for success, non-zero for failures)

## Notes

- The action will fail if the lint command returns a non-zero exit code
- Report annotations are only added if a Checkstyle XML file is found
- When running in container mode, the container must have PHP and Composer already installed
