# Lint

This action lints PHP projects with support for pull request reporting and annotations.

## Features

- 👕 Executes lint command via Composer
- 📊 Auto-detects and processes Checkstyle XML lint reports
- 💬 Annotates pull requests with linting issues
- 🐳 Supports running in Docker containers

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/lint@main
  with:
    working-directory: "."
    container: "false"
```

## Inputs

| Name                 | Description                                                                 | Required | Default |
| -------------------- | --------------------------------------------------------------------------- | -------- | ------- |
| `working-directory`  | Working directory where lint commands are executed. Can be absolute or relative to the repository root. | No | `.` |
| `container`          | Whether running in container mode (skips checkout and PHP setup)           | No       | `false` |
| `report-file`        | Path to lint report file to process as GitHub annotations. Supports Checkstyle XML format. If not specified, auto-detection will be attempted. | No | `` |

## How It Works

1. **Environment Setup** (if not in container mode):
   - Sets up PHP using the setup-php action
   - Configures caching for PHPStan, Psalm, and PHP CS Fixer

2. **Run Linting**:
   - Executes `composer lint` command
   - Captures exit code and output

3. **Report Processing**:
   - Auto-detects lint report files (checkstyle.xml, phpcs-report.xml, etc.)
   - Processes Checkstyle XML format reports
   - Adds GitHub annotations to pull requests

## Report File Auto-Detection

The action automatically searches for common lint report files in the following order:

- `checkstyle-result.xml`
- `checkstyle.xml`
- `phpcs-report.xml`
- `phpcs.xml`
- `lint-results.xml`
- `reports/checkstyle.xml`
- `reports/phpcs.xml`

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

### In Container Mode

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

Your `composer.json` should define a `lint` script:

```json
{
  "scripts": {
    "lint": [
      "@php-cs-fixer",
      "@phpstan"
    ],
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
