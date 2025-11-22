# Test Project for PHP CI

This is a complete PHP test project used to validate the CI workflow with real testing tools.

## Structure

- `src/` - Source code
- `tests/` - PHPUnit tests
- `composer.json` - Project dependencies and scripts
- `phpunit.xml` - PHPUnit configuration
- `phpstan.neon` - PHPStan configuration
- `.php-cs-fixer.php` - PHP CS Fixer configuration
- `Dockerfile` - Docker image for container-based CI

## Testing Tools

This project includes real PHP development tools:
- **PHPUnit** - Unit testing framework
- **PHPStan** - Static analysis tool
- **PHP CS Fixer** - Code style checker and fixer

## Scripts

- `composer lint` - Run PHPStan and PHP CS Fixer
- `composer phpstan` - Run PHPStan static analysis
- `composer php-cs-fixer` - Run PHP CS Fixer
- `composer build` - Build artifacts
- `composer test` - Run PHPUnit tests
- `composer test:coverage` - Run tests with code coverage (requires Xdebug)

## Testing the Workflow

You can test the workflow against this project to ensure all features work correctly:

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      working-directory: "./tests/composer"
```

### With Container

Build and use the Docker image:

```bash
docker build -t php-ci-test:latest ./tests/composer
```

```yaml
jobs:
  ci:
    uses: hoverkraft-tech/ci-github-php/.github/workflows/continuous-integration.yml@main
    with:
      container: "php-ci-test:latest"
```

## Expected Results

When running the workflow:
- **Lint**: PHPStan and PHP CS Fixer should pass with no errors
- **Build**: Creates `dist/test.txt` artifact
- **Test**: 2 PHPUnit tests pass with 2 assertions
