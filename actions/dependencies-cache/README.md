# Dependencies Cache

This action manages caching for common PHP development tools to speed up CI workflows.

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/dependencies-cache@main
  with:
    dependencies: |
      phpunit
      phpstan
      psalm
    working-directory: "."
```

## Inputs

| Name                 | Description                                                                 | Required | Default |
| -------------------- | --------------------------------------------------------------------------- | -------- | ------- |
| `dependencies`       | List of dependencies for which the cache should be managed.                | Yes      |         |
| `working-directory`  | Working directory where the dependencies are installed. Can be absolute or relative to the repository root. | No | `.` |

## Supported Dependencies

The action manages cache directories for the following PHP tools:

| Dependency      | Cache Path                          | Package Name                     |
| --------------- | ----------------------------------- | -------------------------------- |
| `phpunit`       | `.phpunit.cache`                    | `phpunit/phpunit`                |
| `phpstan`       | `.phpstan.cache`                    | `phpstan/phpstan`                |
| `psalm`         | `.psalm.cache`                      | `vimeo/psalm`                    |
| `php-cs-fixer`  | `.php-cs-fixer.cache`              | `friendsofphp/php-cs-fixer`      |

## How It Works

1. Uses [has-installed-dependencies](../has-installed-dependencies/README.md) to check which tools are installed
2. For each installed tool, sets up a cache using `actions/cache@v4`
3. Caches are keyed by `${{ runner.os }}-cache-{tool}-${{ github.sha }}`
4. Restore keys use prefix matching: `${{ runner.os }}-cache-{tool}-`

## Examples

### Basic Usage

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: hoverkraft-tech/ci-github-php/actions/setup-php@main
      
      - uses: hoverkraft-tech/ci-github-php/actions/dependencies-cache@main
        with:
          dependencies: |
            phpunit
            phpstan
      
      - run: composer test
      - run: composer phpstan
```

### With Setup PHP (Recommended)

The `setup-php` action automatically handles dependency caching:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: hoverkraft-tech/ci-github-php/actions/setup-php@main
        with:
          dependencies-cache: |
            phpunit
            phpstan
      
      - run: composer test
      - run: composer phpstan
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
      
      - uses: hoverkraft-tech/ci-github-php/actions/dependencies-cache@main
        with:
          working-directory: "./packages/my-package"
          dependencies: |
            phpunit
      
      - run: composer test
        working-directory: "./packages/my-package"
```

## Benefits

- **Faster CI runs**: Avoids recomputing analysis results on every run
- **Automatic detection**: Only caches tools that are actually installed
- **Efficient storage**: Separate caches for each tool with intelligent key strategies
- **Cross-run optimization**: Restore keys allow using caches from previous commits

## Cache Keys

The action uses the following cache key strategy:

- **Primary key**: `{os}-cache-{tool}-{commit-sha}`
- **Restore keys**: `{os}-cache-{tool}-`

This means:
- Each commit gets its own cache
- If a commit-specific cache doesn't exist, the most recent cache for that tool is used
- Different tools have independent caches
