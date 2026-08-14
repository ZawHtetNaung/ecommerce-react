<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectsAndBlogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_projects_and_only_published_projects_are_public(): void
    {
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;

        $this->postJson('/api/projects', [
            'title' => 'Unauthorized project',
            'project_type' => 'office',
            'status' => 'draft',
        ])->assertUnauthorized();

        $created = $this->withToken($token)->postJson('/api/projects', [
            'title' => 'Dubai Hospitality Terrace',
            'project_type' => 'hospitality',
            'location' => 'Dubai, UAE',
            'summary' => 'An outdoor hospitality project.',
            'content' => '<h2>Project scope</h2><p>Furniture and flooring.</p>',
            'services' => ['Furniture sourcing', 'Installation'],
            'materials' => ['Powder-coated aluminium'],
            'status' => 'published',
            'is_featured' => true,
            'meta_title' => 'Dubai Hospitality Terrace | Messara Living',
        ])->assertCreated();

        $projectId = $created->json('project.id');
        $slug = $created->json('project.slug');

        Project::create([
            'title' => 'Draft Office',
            'slug' => 'draft-office',
            'project_type' => 'office',
            'status' => 'draft',
        ]);

        $this->getJson('/api/public/projects')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.title', 'Dubai Hospitality Terrace');

        $this->getJson('/api/public/projects/'.$slug)
            ->assertOk()
            ->assertJsonPath('project_type', 'hospitality');

        $this->getJson('/api/public/projects/draft-office')->assertNotFound();

        $this->withToken($token)->putJson('/api/projects/'.$projectId, [
            'title' => 'Dubai Hospitality Terrace Updated',
            'slug' => $slug,
            'project_type' => 'hospitality',
            'status' => 'published',
            'is_featured' => false,
        ])->assertOk()->assertJsonPath('project.title', 'Dubai Hospitality Terrace Updated');

        $this->withToken($token)->deleteJson('/api/projects/'.$projectId)->assertOk();
    }

    public function test_admin_can_manage_blog_content_and_public_api_filters_categories(): void
    {
        $admin = User::factory()->admin()->create();
        $token = $admin->createToken('test')->plainTextToken;
        $category = BlogCategory::where('slug', 'buying-guides')->firstOrFail();

        $created = $this->withToken($token)->postJson('/api/blog-posts', [
            'blog_category_id' => $category->id,
            'title' => 'How to choose outdoor furniture',
            'excerpt' => 'A practical guide for UAE outdoor spaces.',
            'content' => '<h2>Start with the space</h2><p>Measure circulation first.</p>',
            'status' => 'published',
            'is_featured' => true,
            'meta_description' => 'Choose outdoor furniture for UAE homes and hospitality spaces.',
        ])->assertCreated();

        $postId = $created->json('post.id');
        $slug = $created->json('post.slug');

        BlogPost::create([
            'title' => 'Draft article',
            'slug' => 'draft-article',
            'status' => 'draft',
        ]);

        $this->getJson('/api/public/blog-categories')
            ->assertOk()
            ->assertJsonFragment(['slug' => 'buying-guides']);

        $this->getJson('/api/public/blog-posts?category=buying-guides')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.title', 'How to choose outdoor furniture');

        $this->getJson('/api/public/blog-posts/'.$slug)
            ->assertOk()
            ->assertJsonPath('category.slug', 'buying-guides');

        $this->getJson('/api/public/blog-posts/draft-article')->assertNotFound();

        $this->withToken($token)->putJson('/api/blog-posts/'.$postId, [
            'blog_category_id' => $category->id,
            'title' => 'Outdoor furniture buying guide',
            'slug' => $slug,
            'status' => 'published',
            'is_featured' => false,
        ])->assertOk()->assertJsonPath('post.title', 'Outdoor furniture buying guide');

        $this->withToken($token)->deleteJson('/api/blog-posts/'.$postId)->assertOk();
    }
}
