<?php

namespace Tests\Unit;

use App\Support\SiteConfig;
use Tests\TestCase;

/**
 * config/site.local.json (solo en cada servidor) reemplaza lo que trae site.json.
 */
class SiteLocalConfigTest extends TestCase
{
    private string $path;

    protected function setUp(): void
    {
        parent::setUp();
        $this->path = base_path('config/site.local.json');

        if (is_file($this->path)) {
            $this->markTestSkipped('Ya existe un config/site.local.json en esta máquina; no se toca.');
        }
    }

    protected function tearDown(): void
    {
        if (isset($this->path) && is_file($this->path) && str_contains((string) file_get_contents($this->path), '3780000000')) {
            unlink($this->path);
        }

        parent::tearDown();
    }

    public function test_el_archivo_local_cambia_solo_lo_que_trae(): void
    {
        SiteConfig::flush();
        $original = SiteConfig::all();

        file_put_contents($this->path, json_encode(['whatsapp' => ['phone' => '3780000000']]));
        SiteConfig::flush();

        $this->assertSame('3780000000', SiteConfig::get('whatsapp.phone'));
        // Lo demás sigue igual que en site.json
        $this->assertSame($original['whatsapp']['default_message'], SiteConfig::get('whatsapp.default_message'));
        $this->assertSame($original['business'], SiteConfig::get('business'));
    }

    public function test_sin_archivo_local_se_usa_site_json(): void
    {
        SiteConfig::flush();

        $this->assertNotSame('3780000000', SiteConfig::get('whatsapp.phone'));
    }
}
