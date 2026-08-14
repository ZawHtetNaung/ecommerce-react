<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('project_type', 40)->index();
            $table->string('location')->nullable();
            $table->string('client_name')->nullable();
            $table->string('area')->nullable();
            $table->date('completed_at')->nullable();
            $table->text('summary')->nullable();
            $table->longText('content')->nullable();
            $table->json('services')->nullable();
            $table->json('materials')->nullable();
            $table->string('cover_image_path')->nullable();
            $table->string('cover_image_alt')->nullable();
            $table->string('status', 20)->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
        });

        Schema::create('project_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('alt_text')->nullable();
            $table->string('caption')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('blog_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('blog_posts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('blog_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('cover_image_path')->nullable();
            $table->string('cover_image_alt')->nullable();
            $table->string('author_name')->nullable();
            $table->string('status', 20)->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
        });

        $now = now();
        DB::table('blog_categories')->insert([
            ['name' => 'News', 'slug' => 'news', 'description' => 'Messara Living announcements, events, and collection updates.', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Buying Guides', 'slug' => 'buying-guides', 'description' => 'Practical guidance for selecting furniture, flooring, wallpaper, and accessories.', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Inspiration', 'slug' => 'inspiration', 'description' => 'Interior ideas for considered residential and commercial spaces.', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Materials', 'slug' => 'materials', 'description' => 'Helpful details about finishes, textiles, flooring, wallpaper, and care.', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'New Collections', 'slug' => 'new-collections', 'description' => 'New furniture and interior collections at Messara Living.', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('seo_pages')->updateOrInsert(
            ['page_key' => 'projects'],
            ['name' => 'Projects', 'path' => '/projects', 'meta_title' => 'Interior Projects | Messara Living', 'meta_description' => 'Explore Messara Living residential, commercial, hospitality, and office projects across the UAE.', 'is_indexable' => true, 'created_at' => $now, 'updated_at' => $now]
        );
        DB::table('seo_pages')->updateOrInsert(
            ['page_key' => 'blog'],
            ['name' => 'Blog', 'path' => '/blog', 'meta_title' => 'Interior Design Blog | Messara Living', 'meta_description' => 'Read Messara Living buying guides, interior inspiration, material advice, company news, and new collection stories.', 'is_indexable' => true, 'created_at' => $now, 'updated_at' => $now]
        );
    }

    public function down(): void
    {
        DB::table('seo_pages')->whereIn('page_key', ['projects', 'blog'])->delete();
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('blog_categories');
        Schema::dropIfExists('project_images');
        Schema::dropIfExists('projects');
    }
};
