<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('seo_pages')->insertOrIgnore([
            'page_key' => 'offers',
            'name' => 'Offers',
            'path' => '/offers',
            'meta_title' => 'Offers | Messara Living',
            'meta_description' => 'Shop current Messara Living offers across furniture, flooring, wallpaper, and home accessories in the UAE.',
            'is_indexable' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('seo_pages')->where('page_key', 'offers')->delete();
    }
};
