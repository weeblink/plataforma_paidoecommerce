<?php

namespace Database\Factories;

use App\Models\CredentialsCheckout;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CredentialsCheckout>
 */
class CredentialsCheckoutFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'app_name'      => "appmax",
            'token'         => "",
            'client_id'    => "",
            'client_secret' => ""
        ];
    }
}
