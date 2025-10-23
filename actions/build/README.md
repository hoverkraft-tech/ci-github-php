# Build

This action builds PHP projects with support for custom commands, environment variables, and artifact handling.

## Features

- 🏗️ Executes build commands via Composer
- 🔐 Supports environment variables and secrets
- 📦 Uploads build artifacts
- 🐳 Supports running in Docker containers

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-php/actions/build@main
  with:
    working-directory: "."
    build-commands: |
      build
      compile
    container: "false"
```

## Inputs

| Name                 | Description                                                                 | Required | Default |
| -------------------- | --------------------------------------------------------------------------- | -------- | ------- |
| `working-directory`  | Working directory where the build commands are executed. Can be absolute or relative to the repository root. | No | `.` |
| `build-commands`     | List of build commands to execute, one per line. These are composer script names (e.g., "build", "compile"). | Yes | |
| `build-env`          | JSON object of environment variables to set during the build. Example: `{"APP_ENV": "production"}` | No | `{}` |
| `build-secrets`      | Multi-line string of secrets in env format (KEY=VALUE).                    | No       | `` |
| `build-artifact`     | JSON object specifying artifact upload configuration. Format: `{"name": "artifact-name", "paths": "path1\npath2"}` | No | `` |
| `container`          | Whether running in container mode (skips checkout and PHP setup)           | No       | `false` |

## Outputs

| Name          | Description                                                |
| ------------- | ---------------------------------------------------------- |
| `artifact-id` | ID of the uploaded artifact (if artifact was specified)   |

## How It Works

1. **Environment Setup** (if not in container mode):
   - Sets up PHP using the setup-php action
   - Installs Composer dependencies

2. **Set Environment Variables**:
   - Exports variables from `build-env` JSON
   - Exports secrets from `build-secrets` multi-line string

3. **Run Build Commands**:
   - Executes each command via `composer <command>`
   - Commands run sequentially in the specified order
   - Fails immediately if any command fails

4. **Upload Artifacts** (if configured):
   - Uploads specified paths as a build artifact
   - Returns artifact ID for later download

## Examples

### Basic Build

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/build@main
        with:
          build-commands: build
```

### Multiple Build Commands

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/build@main
        with:
          build-commands: |
            build
            compile
            package
```

### With Environment Variables

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/build@main
        with:
          build-commands: build
          build-env: |
            {
              "APP_ENV": "production",
              "API_URL": "https://api.example.com"
            }
```

### With Secrets

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hoverkraft-tech/ci-github-php/actions/build@main
        with:
          build-commands: build
          build-secrets: |
            SECRET_KEY=${{ secrets.SECRET_KEY }}
            API_TOKEN=${{ secrets.API_TOKEN }}
```

### With Artifact Upload

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - id: build
        uses: hoverkraft-tech/ci-github-php/actions/build@main
        with:
          build-commands: build
          build-artifact: |
            {
              "name": "my-build",
              "paths": "dist/\nbuild/"
            }
      - run: echo "Artifact ID: ${{ steps.build.outputs.artifact-id }}"
```

### In Container Mode

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    container:
      image: my-php-image:latest
    steps:
      - uses: hoverkraft-tech/ci-github-php/actions/build@main
        with:
          build-commands: build
          container: "true"
```

## Required Composer Scripts

Your `composer.json` should define the build scripts you want to execute:

```json
{
  "scripts": {
    "build": [
      "@build:assets",
      "@build:docs"
    ],
    "build:assets": "php artisan assets:compile",
    "build:docs": "php bin/generate-docs.php",
    "compile": "php bin/compile.php"
  }
}
```

## Build Artifact Format

The `build-artifact` input expects a JSON object with the following structure:

```json
{
  "name": "unique-artifact-name",
  "paths": "path/to/artifact\npath/to/another"
}
```

- `name`: A unique name for the artifact (auto-generated if using the workflow)
- `paths`: Newline-separated list of file paths to include in the artifact

## Notes

- All commands run in the specified working directory
- Commands fail fast - if one fails, subsequent commands are not executed
- Environment variables and secrets are available to all build commands
- When running in container mode, the container must have PHP and Composer already installed
- Artifact upload will fail if no files match the specified paths
