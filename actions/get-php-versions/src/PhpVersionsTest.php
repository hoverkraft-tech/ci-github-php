<?php

declare(strict_types=1);

namespace Hoverkraft\PhpVersions;

use JsonException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use RuntimeException;
use UnexpectedValueException;

final class PhpVersionsTest extends TestCase
{
    private string $directory;
    private PhpVersions $resolver;

    protected function setUp(): void
    {
        $this->directory = sys_get_temp_dir() . '/php-versions-' . bin2hex(random_bytes(8));
        mkdir($this->directory);
        $this->resolver = new PhpVersions(static function (string $url): array {
            if (!str_contains($url, '&version=')) {
                return ['8' => [], '7' => [], '4' => []];
            }
            $versions = str_contains($url, 'version=7') ? ['7.4.33'] : [
                '8.2.1', '8.2.10', '8.3.0', '8.3.12', '8.4.1', '8.5.0', '8.6.0RC1', '9.0.0-dev',
            ];
            return array_fill_keys($versions, []);
        });
    }

    protected function tearDown(): void
    {
        if (is_file($this->directory . '/composer.json')) {
            unlink($this->directory . '/composer.json');
        }
        rmdir($this->directory);
    }

    public static function constraints(): array
    {
        return [
            'caret' => ['^8.2', ['8.2.10', '8.3.12', '8.4.1', '8.5.0']],
            'Composer tilde allows later minors' => ['~8.2', ['8.2.10', '8.3.12', '8.4.1', '8.5.0']],
            'tilde with patch' => ['~8.2.0', ['8.2.10']],
            'patch minimum' => ['>=8.2.5 <8.3', ['8.2.10']],
            'patch maximum' => ['>=8.2 <8.2.10', ['8.2.1']],
            'union skips unsupported minor' => ['~8.2.0 || ~8.4.0', ['8.2.10', '8.4.1']],
            'single pipe' => ['8.2.* | 8.4.*', ['8.2.10', '8.4.1']],
            'excluded patch' => ['>=8.2 <8.5 !=8.3.12', ['8.2.10', '8.3.0', '8.4.1']],
            'end of life remains explicit support' => ['^7.4', ['7.4.33']],
            'prereleases stay excluded' => ['>=8.5@dev', ['8.5.0']],
            'exact patch' => ['8.3.0', ['8.3.0']],
        ];
    }

    #[DataProvider('constraints')]
    public function testComposerConstraints(string $constraint, array $expected): void
    {
        file_put_contents($this->directory . '/composer.json', json_encode(['require' => ['php' => $constraint]]));
        self::assertSame(['php-versions' => $expected, 'php-version' => end($expected)], $this->resolver->resolve($this->directory));
    }

    public function testNewStableMinorAppearsWithoutEditingTheProject(): void
    {
        file_put_contents($this->directory . '/composer.json', '{"require":{"php":"^8.2"}}');
        $resolver = new PhpVersions(static fn (string $url): array => str_contains($url, '&version=')
            ? ['8.5.1' => [], '8.6.0' => [], '8.7.0RC1' => []]
            : ['8' => []]);
        self::assertSame(['8.5.1', '8.6.0'], $resolver->resolve($this->directory)['php-versions']);
    }

    public function testMissingManifestFails(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Missing composer.json');
        $this->resolver->resolve($this->directory);
    }

    public function testMissingConstraintFails(): void
    {
        file_put_contents($this->directory . '/composer.json', '{}');
        $this->expectException(UnexpectedValueException::class);
        $this->expectExceptionMessage('require.php');
        $this->resolver->resolve($this->directory);
    }

    public function testMalformedManifestFails(): void
    {
        file_put_contents($this->directory . '/composer.json', '{');
        $this->expectException(JsonException::class);
        $this->resolver->resolve($this->directory);
    }

    public function testInvalidConstraintFailsBeforeNetworkAccess(): void
    {
        file_put_contents($this->directory . '/composer.json', '{"require":{"php":"garbage"}}');
        $resolver = new PhpVersions(static function (): never {
            self::fail('Invalid input must fail before accessing the network.');
        });
        $this->expectException(UnexpectedValueException::class);
        $resolver->resolve($this->directory);
    }

    public function testNoMatchFailsInsteadOfUsingLatest(): void
    {
        file_put_contents($this->directory . '/composer.json', '{"require":{"php":"^9.0"}}');
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('No stable PHP release matches');
        $this->resolver->resolve($this->directory);
    }

    public function testCatalogFailureIsNotSilentlyIgnored(): void
    {
        file_put_contents($this->directory . '/composer.json', '{"require":{"php":"^8.2"}}');
        $resolver = new PhpVersions(static function (): never {
            throw new RuntimeException('Catalog unavailable');
        });
        $this->expectExceptionMessage('Catalog unavailable');
        $resolver->resolve($this->directory);
    }
}
