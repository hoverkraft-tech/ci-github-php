# Test

This action tests PHP projects with support for coverage reporting and pull request annotations.

## Features

- 🧪 Executes test command via Composer
- 📊 Auto-detects and processes test and coverage reports via [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports)
- 💬 Adds coverage summaries to pull requests
- 🔄 Supports multiple coverage reporters (GitHub, Codecov)
- 🐳 Supports running in Docker containers
- 🗺️ Path mapping support for containerized environments

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/test@main
  with:
    working-directory: "."
    coverage: "github"
    command: "test:ci"
    github-token: ${{ github.token }}
```

## Inputs

| Name                 | Description                                                                 | Required | Default |
| -------------------- | --------------------------------------------------------------------------- | -------- | ------- |
| `working-directory`  | Working directory where test commands are executed. Can be absolute or relative to the repository root. | No | `.` |
| `container`          | Whether running in container mode (skips checkout and PHP setup)           | No       | `false` |
| `command`            | Composer script command to run for testing. Should generate test and coverage reports in standard formats. | No | `test:ci` |
| `coverage`           | Code coverage reporter to use. Supported values: `github`, `codecov`, or empty string to disable | No | `github` |
| `report-file`        | Optional test and coverage report paths. Supports multiple formats. When omitted, uses "auto:test,auto:coverage" detection. | No | `` |
| `path-mapping`       | Optional path mapping to adjust file paths in reports. Format: "container_path:repo_path,..." | No | `` |
| `github-token`       | GitHub token for coverage PR comments. Required when coverage is set to `github`. | No | `` |

## How It Works

1. **Environment Setup** (if not in container mode):
   - Sets up PHP using the setup-php action
   - Configures caching for PHPUnit

2. **Run Tests**:
   - Executes `composer {command}` (default: `composer test:ci`)
   - Captures exit code and output

3. **Coverage Processing** (if enabled):
   - Uses [parse-ci-reports](https://github.com/hoverkraft-tech/ci-github-common/tree/main/actions/parse-ci-reports) action to auto-detect and process test/coverage reports
   - Supports multiple report formats (Cobertura, Clover, JUnit, etc.)
   - Generates coverage summary and adds to PR (for GitHub)
   - Uploads to Codecov (if configured)

## Report File Auto-Detection

When `report-file` is not specified, the action uses "auto:test,auto:coverage" detection which searches for common test and coverage report patterns in your working directory.

## Coverage Reporters

### GitHub (Default)

Parses coverage reports and posts summary as a PR comment.

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/test@main
  with:
    coverage: "github"
    github-token: ${{ github.token }}
```

### Codecov

Uploads coverage data to Codecov with OIDC authentication.

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/test@main
  with:
    coverage: "codecov"
```

### Disabled

Skip coverage reporting entirely.

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/test@main
  with:
    coverage: ""
```

## Examples

### Basic Usage

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/test@main
```

### With Custom Command

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/test@main
        with:
          command: "test:with-coverage"
```

### With GitHub Coverage

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/test@main
        with:
          coverage: "github"
          github-token: ${{ github.token }}
```

### With Codecov

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/test@main
        with:
          coverage: "codecov"
```

### With Custom Report Files

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/test@main
        with:
          coverage: "github"
          report-file: "build/logs/clover.xml,junit.xml"
          github-token: ${{ github.token }}
```

### In Container Mode with Path Mapping

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: my-php-image:latest
    steps:
      - uses: hoverkraft-tech/ci-github-php/actions/test@main
        with:
          container: "true"
          coverage: "github"
          path-mapping: "/app:."
          github-token: ${{ github.token }}
```

### Custom Working Directory

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/test@main
        with:
          working-directory: "./api"
```

## Required Composer Script

Your `composer.json` should define a `test:ci` script (or the command you specify):

```json
{
  "scripts": {
    "test:ci": "phpunit",
    "test": "phpunit"
  }
}
```

## Configuring Coverage in PHPUnit

To generate coverage reports, configure PHPUnit to output reports in standard formats:

### Clover Format (Recommended)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="vendor/autoload.php">
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">src</directory>
        </include>
        <report>
            <clover outputFile="coverage/clover.xml"/>
        </report>
    </coverage>
</phpunit>
```

### Cobertura Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="vendor/autoload.php">
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">src</directory>
        </include>
        <report>
            <cobertura outputFile="coverage/cobertura-coverage.xml"/>
        </report>
    </coverage>
</phpunit>
```

## Output

The action sets the following output:

- `test-exit-code`: The exit code from the test command (0 for success, non-zero for failures)

## Required Permissions

### For GitHub Coverage (PR Comments)

```yaml
permissions:
  contents: read
  pull-requests: write
```

### For Codecov with OIDC

```yaml
permissions:
  id-token: write
```

## Notes

- The action will fail if the test command returns a non-zero exit code
- Coverage reporting is only performed if a coverage file is found
- GitHub coverage comments are only added on pull requests
- When running in container mode:
  - The container must have PHP and Composer already installed
  - For Codecov, Git, curl, and gnupg are automatically installed
- Coverage files are automatically detected, but you can specify a custom path
- Multiple coverage file formats are supported (Clover, Cobertura, etc.)
