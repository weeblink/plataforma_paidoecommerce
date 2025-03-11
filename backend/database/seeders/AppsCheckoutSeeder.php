<?php

namespace Database\Seeders;

use App\Models\CredentialsCheckout;
use Illuminate\Database\Seeder;

class AppsCheckoutSeeder extends Seeder
{

    public function run() : void
    {
        CredentialsCheckout::factory()->create([
            'app_name'          => "appmax",
            'token'             => "872231A9-A5C85A4F-D197B28A-3DE982B8", // TODO: Change to deploy keys
            'client_id'        => "",
            'client_secret'    => "",
            'app_id'            => "appmax"
        ]);
    }
}
