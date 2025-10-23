# Setup PHP

This action sets up PHP, configures Composer, installs dependencies, and manages caching for PHP projects.

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/setup-php@main
  with:
    working-directory: "."
    dependencies-cache: |
      phpunit
      phpstan
```

## Inputs

| Name                 | Description                                                                 | Required | Default |
| -------------------- | --------------------------------------------------------------------------- | -------- | ------- |
| `working-directory`  | Working directory where the dependencies are installed. Can be absolute or relative to the repository root. | No | `.` |
| `dependencies-cache` | List of dependencies for which the cache should be managed (e.g., phpunit, phpstan, psalm, php-cs-fixer). | No | `` |

## Outputs

| Name                    | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `run-script-command`    | The command to run a script in the composer.json file.    |

## How It Works

1. Detects the package manager (Composer)
2. Reads PHP version from `composer.json` `require.php` field or defaults to PHP 8.1
3. Sets up PHP using [shivammathur/setup-php](https://github.com/shivammathur/setup-php)
4. Installs Composer dependencies
5. Manages dependency-specific caches (if specified)

## Examples

### Basic Setup

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/setup-php@main
      - run: composer test
```

### With Dependency Caching

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - id: setup
        uses: hoverkraft-tech/ci-github-php/actions/setup-php@main
        with:
          dependencies-cache: |
            phpunit
            phpstan
      - run: ${{ steps.setup.outputs.run-script-command }} test
```

### Custom Working Directory

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/setup-php@main
        with:
          working-directory: "./packages/my-package"
      - run: composer test
        working-directory: "./packages/my-package"
```

## Supported PHP Versions

The action automatically detects the PHP version from your `composer.json` file. If not specified, it defaults to PHP 8.1.

Example `composer.json`:
```json
{
  "require": {
    "php": "^8.2"
  }
}
```

## Supported Cache Dependencies

- `phpunit` - PHPUnit test framework cache
- `phpstan` - PHPStan static analysis cache
- `psalm` - Psalm static analysis cache
- `php-cs-fixer` - PHP CS Fixer cache
