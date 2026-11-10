<?php

declare(strict_types=1);

namespace Hoverkraft\PhpVersions;

use Closure;
use Composer\Semver\Semver;
use Composer\Semver\VersionParser;
use RuntimeException;
use UnexpectedValueException;

final class PhpVersions
{
    private const RELEASES_URL = 'https://www.php.net/releases/index.php?json';

    private readonly Closure $fetch;

    public function __construct(?Closure $fetch = null)
    {
        $this->fetch = $fetch ?? self::fetch(...);
    }

    /** @return array{php-versions: list<string>, php-version: string} */
    public function resolve(string $directory): array
    {
        $file = rtrim($directory, '/\\') . '/composer.json';
        if (!is_file($file)) {
            throw new RuntimeException('Missing composer.json in ' . $directory);
        }
        $manifest = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
        $constraint = $manifest['require']['php'] ?? null;
        if (!is_string($constraint) || trim($constraint) === '') {
            throw new UnexpectedValueException('Declare require.php in composer.json or select PHP explicitly.');
        }
        // Validate before requesting the release catalog, using Composer's own parser.
        (new VersionParser())->parseConstraints($constraint);
        $releases = [];
        foreach (array_keys(($this->fetch)(self::RELEASES_URL)) as $major) {
            if (!ctype_digit((string) $major) || (int) $major < 5) {
                continue;
            }
            $catalog = ($this->fetch)(self::RELEASES_URL . '&version=' . $major . '&max=1000');
            foreach (array_keys($catalog) as $version) {
                if (preg_match('/^\d+\.\d+\.\d+$/D', (string) $version) && version_compare($version, '5.3.0', '>=')) {
                    $releases[] = $version;
                }
            }
        }
        $matches = Semver::sort(Semver::satisfiedBy($releases, $constraint));
        $versions = [];
        foreach ($matches as $version) {
            $minor = substr($version, 0, strrpos($version, '.'));
            $versions[$minor] = $version;
        }
        if ($versions === []) {
            throw new RuntimeException('No stable PHP release matches require.php: ' . $constraint);
        }
        return ['php-versions' => array_values($versions), 'php-version' => end($versions)];
    }

    private static function fetch(string $url): array
    {
        $context = stream_context_create(['http' => ['timeout' => 20, 'user_agent' => 'hoverkraft-php-versions']]);
        for ($attempt = 0; $attempt < 3; $attempt++) {
            $body = @file_get_contents($url, false, $context);
            if ($body !== false) {
                $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
                if (!is_array($data) || $data === []) {
                    throw new UnexpectedValueException('Invalid PHP release catalog: ' . $url);
                }
                return $data;
            }
            if ($attempt < 2) {
                usleep(500000 * ($attempt + 1));
            }
        }
        throw new RuntimeException('Cannot retrieve the PHP release catalog: ' . $url);
    }
}
