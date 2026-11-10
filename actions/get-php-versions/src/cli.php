<?php

declare(strict_types=1);

use Hoverkraft\PhpVersions\PhpVersions;

require dirname(__DIR__) . '/vendor/autoload.php';

try {
    if ($argc < 2 || $argc > 3 || ($argc === 3 && $argv[2] !== '--latest')) {
        throw new InvalidArgumentException('Usage: php src/cli.php PROJECT_DIRECTORY [--latest]');
    }
    $directory = realpath($argv[1]);
    if ($directory === false || !is_dir($directory)) {
        throw new InvalidArgumentException('Project directory does not exist: ' . $argv[1]);
    }
    $workspace = getenv('GITHUB_WORKSPACE');
    if ($workspace !== false && $workspace !== '') {
        $workspace = realpath($workspace);
        if ($workspace === false || ($directory !== $workspace && !str_starts_with($directory, $workspace . '/'))) {
            throw new InvalidArgumentException('Project directory must be inside GITHUB_WORKSPACE.');
        }
    }
    $versions = (new PhpVersions())->resolve($directory);
    echo (($argv[2] ?? '') === '--latest' ? $versions['php-version'] : json_encode($versions, JSON_THROW_ON_ERROR)) . PHP_EOL;
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . PHP_EOL);
    exit(1);
}
