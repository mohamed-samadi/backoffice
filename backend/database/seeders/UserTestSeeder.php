<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
class UserTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Mohamed Reda',
            'email' => 'reda.dev@example.com',
            'password' => Hash::make('password123'), // تأكد من تشفير كلمة المرور دائماً
            'company_id' => null, // اضبطه حسب منطق تطبيقك
        ]);
    }
}
