<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('seo_pages')->insertOrIgnore([
            'page_key' => 'privacy_policy',
            'name' => 'Privacy Policy',
            'path' => '/privacy-policy-2/',
            'meta_title' => 'Privacy Policy | Messara Living',
            'meta_description' => 'Read the Messara Living privacy policy, website terms, order, delivery, returns, refund, and installation information for the UAE.',
            'is_indexable' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('seo_pages')->where('page_key', 'privacy_policy')->delete();
    }
};
