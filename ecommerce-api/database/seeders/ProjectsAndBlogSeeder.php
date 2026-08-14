<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectsAndBlogSeeder extends Seeder
{
    public function run(): void
    {
        $publishedAt = now()->subDay();

        $projects = [
            [
                'title' => 'Contemporary Villa Living Room',
                'slug' => 'contemporary-villa-living-room',
                'project_type' => 'residential',
                'location' => 'Dubai, UAE',
                'area' => '85 m²',
                'completed_at' => now()->subMonths(2)->toDateString(),
                'summary' => 'A calm, contemporary living room shaped around comfortable furniture, warm textures, and everyday family life.',
                'content' => '<p>This residential project brings together a comfortable seating plan, layered neutral finishes, and practical pieces for daily living.</p><p>The result is an inviting room with clear circulation and a balanced mix of texture and colour.</p>',
                'services' => ['Furniture selection', 'Space planning', 'Styling'],
                'materials' => ['Textured fabric', 'Natural wood', 'Decorative wallpaper'],
                'status' => 'published',
                'is_featured' => true,
                'published_at' => $publishedAt,
                'sort_order' => 1,
                'meta_title' => 'Contemporary Villa Living Room Project | Messara Living',
                'meta_description' => 'Explore a contemporary Dubai villa living room project featuring comfortable furniture, warm textures, and practical space planning.',
            ],
            [
                'title' => 'Outdoor Terrace Refresh',
                'slug' => 'outdoor-terrace-refresh',
                'project_type' => 'hospitality',
                'location' => 'Sharjah, UAE',
                'area' => '120 m²',
                'completed_at' => now()->subMonths(4)->toDateString(),
                'summary' => 'A welcoming terrace updated with durable outdoor furniture and a flexible layout for dining and relaxed gatherings.',
                'content' => '<p>The terrace was organised into relaxed seating and dining zones using outdoor-ready furniture selected for comfort and easy maintenance.</p><p>A simple material palette keeps the space fresh, practical, and welcoming throughout the day.</p>',
                'services' => ['Outdoor furniture', 'Layout planning', 'Product specification'],
                'materials' => ['Powder-coated metal', 'Outdoor fabric', 'Weather-resistant finishes'],
                'status' => 'published',
                'is_featured' => true,
                'published_at' => $publishedAt,
                'sort_order' => 2,
                'meta_title' => 'Outdoor Terrace Refresh Project | Messara Living',
                'meta_description' => 'See a Sharjah outdoor terrace refreshed with durable furniture and flexible dining and lounge areas.',
            ],
            [
                'title' => 'Modern Office Flooring Update',
                'slug' => 'modern-office-flooring-update',
                'project_type' => 'office',
                'location' => 'Dubai, UAE',
                'area' => '240 m²',
                'completed_at' => now()->subMonths(6)->toDateString(),
                'summary' => 'A practical office flooring update designed to improve durability, comfort, and visual flow between work zones.',
                'content' => '<p>This office update uses coordinated flooring finishes to define work, meeting, and circulation areas without interrupting the open layout.</p><p>The selected materials are durable, easy to maintain, and appropriate for daily commercial use.</p>',
                'services' => ['Flooring consultation', 'Material selection', 'Installation coordination'],
                'materials' => ['Commercial carpet tile', 'Resilient flooring', 'Transition profiles'],
                'status' => 'published',
                'is_featured' => false,
                'published_at' => $publishedAt,
                'sort_order' => 3,
                'meta_title' => 'Modern Office Flooring Project | Messara Living',
                'meta_description' => 'Discover a modern Dubai office flooring update designed for durability, comfort, and clear visual zoning.',
            ],
        ];

        foreach ($projects as $project) {
            Project::updateOrCreate(['slug' => $project['slug']], $project);
        }

        $categoryIds = BlogCategory::query()
            ->whereIn('slug', ['buying-guides', 'inspiration', 'materials'])
            ->pluck('id', 'slug');

        $posts = [
            [
                'blog_category_id' => $categoryIds->get('buying-guides'),
                'title' => 'How to Choose the Right Sofa for Your Space',
                'slug' => 'how-to-choose-the-right-sofa-for-your-space',
                'excerpt' => 'A simple guide to sofa size, comfort, materials, and layout before you make your choice.',
                'content' => '<h2>Start with the room</h2><p>Measure the available wall space, doors, and walking routes before choosing a sofa. Leave enough room to move comfortably around it.</p><h2>Think about daily use</h2><p>Choose the seat depth, fabric, and configuration around how your household uses the room. A practical sofa should feel comfortable and suit the scale of the space.</p><h2>Check the details</h2><p>Compare dimensions, care requirements, colour samples, and delivery access before ordering.</p>',
                'author_name' => 'Messara Living',
                'status' => 'published',
                'is_featured' => true,
                'published_at' => $publishedAt,
                'meta_title' => 'How to Choose the Right Sofa | Messara Living',
                'meta_description' => 'Learn how to choose the right sofa size, layout, comfort level, and material for your living space.',
            ],
            [
                'blog_category_id' => $categoryIds->get('inspiration'),
                'title' => 'Three Easy Ways to Refresh a Living Room',
                'slug' => 'three-easy-ways-to-refresh-a-living-room',
                'excerpt' => 'Give your living room a considered new look with colour, texture, and a clearer furniture arrangement.',
                'content' => '<h2>Rework the layout</h2><p>Start by improving circulation and arranging the main seating around a clear focal point.</p><h2>Add a layer of texture</h2><p>Use cushions, rugs, curtains, or wallpaper to create depth without overcrowding the room.</p><h2>Repeat one accent colour</h2><p>A repeated accent across a few carefully chosen pieces helps the room feel connected and intentional.</p>',
                'author_name' => 'Messara Living',
                'status' => 'published',
                'is_featured' => true,
                'published_at' => $publishedAt,
                'meta_title' => 'Three Easy Living Room Refresh Ideas | Messara Living',
                'meta_description' => 'Refresh your living room with three simple ideas covering furniture layout, texture, and accent colours.',
            ],
            [
                'blog_category_id' => $categoryIds->get('materials'),
                'title' => 'A Simple Guide to Choosing Flooring',
                'slug' => 'a-simple-guide-to-choosing-flooring',
                'excerpt' => 'Compare appearance, durability, care, and room conditions when selecting flooring for a project.',
                'content' => '<h2>Match the flooring to the room</h2><p>Consider foot traffic, moisture, sunlight, cleaning, and acoustic comfort before focusing on colour alone.</p><h2>Review samples in place</h2><p>Look at physical samples in the actual room during different times of day because lighting can change the appearance.</p><h2>Plan installation early</h2><p>Confirm the subfloor condition, quantities, transitions, and installation programme before work begins.</p>',
                'author_name' => 'Messara Living',
                'status' => 'published',
                'is_featured' => false,
                'published_at' => $publishedAt,
                'meta_title' => 'Simple Flooring Selection Guide | Messara Living',
                'meta_description' => 'A practical guide to choosing flooring based on room conditions, durability, samples, and installation requirements.',
            ],
        ];

        foreach ($posts as $post) {
            BlogPost::updateOrCreate(['slug' => $post['slug']], $post);
        }
    }
}
