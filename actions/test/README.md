# Test

This action tests PHP projects with support for coverage reporting and pull request annotations.

## Features

- 🧪 Executes test command via Composer
- 📊 Auto-detects and processes code coverage reports
- 💬 Adds coverage summaries to pull requests
- 🔄 Supports multiple coverage reporters (GitHub, Codecov)
- 🐳 Supports running in Docker containers

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/test@main
  with:
    working-directory: "."
    coverage: "github"
    github-token: ${{ github.token }}
```

## Inputs

| Name                 | Description                                                                 | Required | Default |
| -------------------- | --------------------------------------------------------------------------- | -------- | ------- |
| `working-directory`  | Working directory where test commands are executed. Can be absolute or relative to the repository root. | No | `.` |
| `container`          | Whether running in container mode (skips checkout and PHP setup)           | No       | `false` |
| `coverage`           | Code coverage reporter to use. Supported values: `github`, `codecov`, or empty string to disable | No | `github` |
| `coverage-files`     | Path to coverage files for reporting. Supports Cobertura, Clover formats. Can be a single file or multiple files separated by semicolons. | No | `` |
| `github-token`       | GitHub token for coverage PR comments. Required when coverage is set to `github`. | No | `` |

## How It Works

1. **Environment Setup** (if not in container mode):
   - Sets up PHP using the setup-php action
   - Configures caching for PHPUnit

2. **Run Tests**:
   - Executes `composer test` command
   - Captures exit code and output

3. **Coverage Processing** (if enabled):
   - Auto-detects coverage files (clover.xml, coverage.xml, etc.)
   - Generates coverage report with ReportGenerator (for GitHub)
   - Uploads to Codecov (if configured)
   - Adds PR comment with coverage summary

## Coverage File Auto-Detection

The action automatically searches for common coverage files in the following order:

- `coverage/clover.xml`
- `coverage/coverage.xml`
- `coverage/cobertura-coverage.xml`
- `build/logs/clover.xml`
- `test-results/coverage.xml`
- `test-results/clover.xml`

## Coverage Reporters

### GitHub (Default)

Generates a coverage summary and posts it as a PR comment using ReportGenerator.

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

### With Custom Coverage File

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/test@main
        with:
          coverage: "github"
          coverage-files: "build/logs/clover.xml"
          github-token: ${{ github.token }}
```

### In Container Mode

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
          coverage: "codecov"
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

Your `composer.json` should define a `test` script:

```json
{
  "scripts": {
    "test": "phpunit"
  }
}
```

## Configuring Coverage in PHPUnit

To generate coverage reports, configure PHPUnit in your `phpunit.xml`:

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
