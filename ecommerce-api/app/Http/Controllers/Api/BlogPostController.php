<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BlogPostController extends Controller
{
    public function publicIndex(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 12), 1), 24);
        $search = trim((string) $request->query('q', ''));
        $posts = BlogPost::query()
            ->published()
            ->with('category')
            ->where(function ($query): void {
                $query->whereNull('blog_category_id')->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('is_active', true));
            })
            ->when($request->filled('category'), fn ($query) => $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $request->query('category'))))
            ->when($request->boolean('featured'), fn ($query) => $query->where('is_featured', true))
            ->when($search !== '', function ($query) use ($search): void {
                $like = '%'.$search.'%';
                $query->where(fn ($searchQuery) => $searchQuery->where('title', 'like', $like)->orWhere('excerpt', 'like', $like)->orWhere('content', 'like', $like));
            })
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function publicShow(string $slug)
    {
        return response()->json(BlogPost::query()->published()->where('slug', $slug)->with('category')->firstOrFail());
    }

    public function index()
    {
        return response()->json(BlogPost::query()->with('category')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $this->validatePost($request);
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? $validated['title']);
        $validated['published_at'] = $this->publishedAt($validated);
        $validated['author_name'] = $validated['author_name'] ?? $request->user()?->name;
        if ($request->hasFile('cover_image')) {
            $validated['cover_image_path'] = $request->file('cover_image')->store('blog', 'public');
        }
        $post = BlogPost::create($this->postData($validated));
        return response()->json(['message' => 'Blog post created successfully.', 'post' => $post->load('category')], 201);
    }

    public function show(BlogPost $blogPost)
    {
        return response()->json($blogPost->load('category'));
    }

    public function update(Request $request, BlogPost $blogPost)
    {
        $validated = $this->validatePost($request, $blogPost);
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?? $validated['title'], $blogPost->id);
        $validated['published_at'] = $this->publishedAt($validated, $blogPost);
        if ($request->hasFile('cover_image')) {
            if ($blogPost->cover_image_path) Storage::disk('public')->delete($blogPost->cover_image_path);
            $validated['cover_image_path'] = $request->file('cover_image')->store('blog', 'public');
        }
        $blogPost->update($this->postData($validated));
        return response()->json(['message' => 'Blog post updated successfully.', 'post' => $blogPost->fresh()->load('category')]);
    }

    public function destroy(BlogPost $blogPost)
    {
        if ($blogPost->cover_image_path) Storage::disk('public')->delete($blogPost->cover_image_path);
        $blogPost->delete();
        return response()->json(['message' => 'Blog post deleted successfully.']);
    }

    private function validatePost(Request $request, ?BlogPost $post = null): array
    {
        return $request->validate([
            'blog_category_id' => ['nullable', 'integer', 'exists:blog_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blog_posts', 'slug')->ignore($post?->id)],
            'excerpt' => ['nullable', 'string', 'max:3000'],
            'content' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
            'cover_image_alt' => ['nullable', 'string', 'max:255'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'is_featured' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:1000'],
        ]);
    }

    private function postData(array $validated): array
    {
        return collect($validated)->only([
            'blog_category_id', 'title', 'slug', 'excerpt', 'content', 'cover_image_path',
            'cover_image_alt', 'author_name', 'status', 'is_featured', 'published_at',
            'meta_title', 'meta_description',
        ])->merge(['is_featured' => $validated['is_featured'] ?? false])->all();
    }

    private function publishedAt(array $validated, ?BlogPost $post = null)
    {
        if (($validated['status'] ?? 'draft') !== 'published') return $validated['published_at'] ?? null;
        return $validated['published_at'] ?? $post?->published_at ?? now();
    }

    private function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: 'post';
        $slug = $base;
        $suffix = 2;
        while (BlogPost::where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = $base.'-'.$suffix++;
        }
        return $slug;
    }
}
