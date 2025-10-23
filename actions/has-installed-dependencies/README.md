# Has Installed Dependencies

This action checks whether specific PHP dependencies have been installed via Composer.

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/has-installed-dependencies@main
  with:
    dependencies: |
      phpunit
      phpstan
    working-directory: "."
```

## Inputs

| Name                 | Description                                                                 | Required | Default |
| -------------------- | --------------------------------------------------------------------------- | -------- | ------- |
| `dependencies`       | List of dependencies to check (e.g., phpunit, phpstan, psalm, php-cs-fixer). | Yes | |
| `working-directory`  | Working directory where the dependencies are installed. Can be absolute or relative to the repository root. | No | `.` |

## Outputs

| Name                      | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| `installed-dependencies`  | A JSON object mapping dependency names to boolean installation status. |

## How It Works

1. Runs `composer show --locked --format=json` to get the list of installed packages
2. Checks each requested dependency against the installed packages
3. Supports pattern matching for related packages (e.g., `phpunit` matches `phpunit/phpunit`)
4. Returns a JSON object with the installation status for each dependency

## Supported Dependency Patterns

The action recognizes the following common PHP tools and their package names:

- `phpunit` → `phpunit/phpunit`
- `phpstan` → `phpstan/phpstan`
- `psalm` → `vimeo/psalm`
- `php-cs-fixer` → `friendsofphp/php-cs-fixer`

## Example

```yaml
jobs:
  check-tools:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: hoverkraft-tech/ci-github-php/actions/setup-php@main
      
      - id: check-deps
        uses: hoverkraft-tech/ci-github-php/actions/has-installed-dependencies@main
        with:
          dependencies: |
            phpunit
            phpstan
            psalm
      
      - name: Run PHPUnit if installed
        if: fromJson(steps.check-deps.outputs.installed-dependencies).phpunit == true
        run: composer test
      
      - name: Run PHPStan if installed
        if: fromJson(steps.check-deps.outputs.installed-dependencies).phpstan == true
        run: composer phpstan
```

## Output Format

The output is a JSON string that can be parsed using `fromJson()`:

```json
{
  "phpunit": true,
  "phpstan": true,
  "psalm": false,
  "php-cs-fixer": false
}
```

## Use Cases

This action is primarily used internally by the [dependencies-cache](../dependencies-cache/README.md) action to determine which caches to manage, but it can also be used in custom workflows to conditionally run steps based on installed dependencies.
