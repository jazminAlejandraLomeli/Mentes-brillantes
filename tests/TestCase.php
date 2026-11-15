<?php

namespace Tests;

use App\Models\User;
use App\Support\SiteConfig;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Las pruebas no dependen del config/site.json real (que cambia por cliente):
        // parten de Mentes Brillantes con una sola maestra.
        // Cada prueba puede simular otro cliente con SiteConfig::fake([...]).
        SiteConfig::fake([
            'business' => ['name' => 'Mentes Brillantes', 'full_name' => 'Mentes Brillantes by Liz', 'owner' => 'Liz', 'signature' => 'Liz de Mentes Brillantes'],
            'features' => ['multi_teacher' => false],
        ]);
    }

    protected function tearDown(): void
    {
        SiteConfig::flush();

        parent::tearDown();
    }

    protected function signIn(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        return $user;
    }
}
