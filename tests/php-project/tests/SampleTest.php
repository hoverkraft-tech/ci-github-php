<?php

namespace TestCi\Tests;

use PHPUnit\Framework\TestCase;
use TestCi\Sample;

class SampleTest extends TestCase
{
    public function testSample(): void
    {
        $sample = new Sample();
        $this->assertSame('sample', $sample->sample());
    }
}
