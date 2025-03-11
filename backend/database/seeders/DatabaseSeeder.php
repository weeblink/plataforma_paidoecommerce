<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\UsersInfo;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = User::factory()->create([
            'name' => 'Cristian Seller',
            'email' => 'naoresponda@clubedosfoguetes.com.br',
            'cpf'       => '10134711645',
            'password' => bcrypt('d9T66Aw*'),
        ]);

        $userInfo = new UsersInfo();
        $userInfo->user_id      = $user->id;
        $userInfo->phone        = '55999999999';
        $userInfo->user_type    = 'ADMIN';

        $userInfo->save();
    }
}
