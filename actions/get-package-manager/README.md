# Get Package Manager

This action detects the PHP package manager (Composer) used in the project and provides information about how to install dependencies and run scripts.

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/get-package-manager@main
  with:
    working-directory: "."
```

## Inputs

| Name                 | Description                                                                 | Required | Default |
| -------------------- | --------------------------------------------------------------------------- | -------- | ------- |
| `working-directory`  | Working directory where the dependencies are installed. Can be absolute or relative to the repository root. | No | `.` |

## Outputs

| Name                    | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `package-manager`       | The package manager used (always `composer` for PHP).     |
| `cache-dependency-path` | The path to the dependency file for cache management.     |
| `install-command`       | The command to install dependencies.                       |
| `run-script-command`    | The command to run a script in the composer.json file.    |

## How It Works

1. Checks if `composer.json` exists in the working directory
2. Verifies that `composer.lock` exists (required for reproducible builds)
3. Returns Composer as the package manager with appropriate commands:
   - Install command: `composer install --no-interaction --no-progress --prefer-dist`
   - Run script command: `composer`
   - Cache dependency path: `**/composer.lock`

## Example

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - id: package-manager
        uses: hoverkraft-tech/ci-github-php/actions/get-package-manager@main
        with:
          working-directory: "."
      
      - name: Install dependencies
        run: ${{ steps.package-manager.outputs.install-command }}
      
      - name: Run tests
        run: ${{ steps.package-manager.outputs.run-script-command }} test
```
